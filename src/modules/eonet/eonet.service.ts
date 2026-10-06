import { Inject, Injectable, Logger } from "@nestjs/common";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { IEonetProvider } from "src/shared/providers/eonet/models/eonet-provider.interface";
import { ScheduledTask } from "src/shared/providers/scheduler/decorators/scheduled-task.decorator";
import { CACHE_PROVIDER, EONET_PROVIDER, EONET_REPOSITORY } from "src/shared/tokens";
import { EonetEventsQueryDto } from "./dto/eonet-events-query.dto";
import { IEonetRepository } from "./repositories/eonet-repository.interface";

import type { DeepPartial } from "typeorm";
import type {
    EonetCategory,
    EonetEvent,
    EonetSource,
} from "src/shared/providers/eonet/models/eonet-response.interface";
import type { EonetEventEntity } from "./entities/eonet-event.entity";

const EVENTS_CACHE_TTL_SECONDS = 60 * 30;
const CATALOG_CACHE_TTL_SECONDS = 60 * 60 * 24;

@Injectable()
export class EonetService {
    private readonly logger = new Logger(EonetService.name);

    constructor(
        @Inject(EONET_PROVIDER) private readonly eonetProvider: IEonetProvider,
        @Inject(EONET_REPOSITORY) private readonly eonetRepository: IEonetRepository,
        @Inject(CACHE_PROVIDER) private readonly cacheProvider: ICacheProvider,
    ) {}

    async findEvents(query: EonetEventsQueryDto): Promise<EonetEvent[]> {
        const cacheKey = `eonet:events:${query.status ?? "open"}:${query.category ?? "all"}:${query.days ?? "any"}:${query.limit ?? 50}`;

        return await this.cacheProvider.getOrSet<EonetEvent[]>(cacheKey, EVENTS_CACHE_TTL_SECONDS, async () => {
            const stored = await this.eonetRepository.findEvents(query);

            if (stored.length > 0) {
                return stored.map((event) => event.payload);
            }

            const events = await this.eonetProvider.getEvents(query);
            await this.persist(events);

            return events;
        });
    }

    async findCategories(): Promise<EonetCategory[]> {
        return await this.cacheProvider.getOrSet("eonet:categories", CATALOG_CACHE_TTL_SECONDS, () =>
            this.eonetProvider.getCategories(),
        );
    }

    async findSources(): Promise<EonetSource[]> {
        return await this.cacheProvider.getOrSet("eonet:sources", CATALOG_CACHE_TTL_SECONDS, () =>
            this.eonetProvider.getSources(),
        );
    }

    async findLayers(category?: string): Promise<unknown> {
        return await this.cacheProvider.getOrSet(`eonet:layers:${category ?? "all"}`, CATALOG_CACHE_TTL_SECONDS, () =>
            this.eonetProvider.getLayers(category),
        );
    }

    @ScheduledTask({ name: "eonet:open-events", cron: "0 */6 * * *" })
    async syncOpenEvents(): Promise<void> {
        try {
            const events = await this.eonetProvider.getEvents({ status: "open", limit: 500 });
            await this.persist(events);
            this.logger.log(`${events.length} evento(s) aberto(s) do EONET sincronizado(s).`);
        } catch (error) {
            this.logger.warn(`Falha ao sincronizar eventos do EONET: ${(error as Error).message}`);
        }
    }

    private async persist(events: EonetEvent[]): Promise<void> {
        if (events.length === 0) {
            return;
        }

        await this.eonetRepository.upsertMany(events.map((event) => this.toEntity(event)));
    }

    private toEntity(event: EonetEvent): DeepPartial<EonetEventEntity> {
        const geometryDates = (event.geometry ?? [])
            .map((geometry) => new Date(geometry.date).getTime())
            .filter((time) => Number.isFinite(time));

        return {
            eonet_id: event.id,
            title: event.title,
            closed: event.closed ? new Date(event.closed) : null,
            category_ids: (event.categories ?? []).map((category) => category.id),
            last_geometry_at: geometryDates.length > 0 ? new Date(Math.max(...geometryDates)) : null,
            payload: event,
        };
    }
}
