import { Inject, Injectable, Logger } from "@nestjs/common";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { INeoProvider } from "src/shared/providers/neo/models/neo-provider.interface";
import { ScheduledTask } from "src/shared/providers/scheduler/decorators/scheduled-task.decorator";
import { CACHE_PROVIDER, NEO_PROVIDER, NEO_REPOSITORY } from "src/shared/tokens";
import { addDays, countDaysBetween, toIsoDate } from "src/shared/utils/date.util";
import { INeoRepository } from "./repositories/neo-repository.interface";

import type { DeepPartial } from "typeorm";
import type {
    NeoBrowseResponse,
    NeoFeedResponse,
    NeoObject,
} from "src/shared/providers/neo/models/neo-response.interface";
import type { NeoObjectEntity } from "./entities/neo-object.entity";

const CACHE_TTL_SECONDS = 60 * 60 * 6;

@Injectable()
export class NeoService {
    private readonly logger = new Logger(NeoService.name);

    constructor(
        @Inject(NEO_PROVIDER) private readonly neoProvider: INeoProvider,
        @Inject(NEO_REPOSITORY) private readonly neoRepository: INeoRepository,
        @Inject(CACHE_PROVIDER) private readonly cacheProvider: ICacheProvider,
    ) {}

    async findFeed(startDate: string, endDate: string): Promise<NeoFeedResponse> {
        return await this.cacheProvider.getOrSet<NeoFeedResponse>(
            `neo:feed:${startDate}:${endDate}`,
            CACHE_TTL_SECONDS,
            async () => {
                const expectedDays = countDaysBetween(new Date(startDate), new Date(endDate));
                const storedDays = await this.neoRepository.findFeedDays(startDate, endDate);

                if (storedDays.length === expectedDays) {
                    return await this.buildFeedFromDatabase(storedDays);
                }

                const feed = await this.neoProvider.getFeed(startDate, endDate);
                await this.persistFeed(feed);

                return feed;
            },
        );
    }

    async findById(asteroidId: string): Promise<NeoObject> {
        return await this.cacheProvider.getOrSet<NeoObject>(`neo:object:${asteroidId}`, CACHE_TTL_SECONDS, async () => {
            const stored = await this.neoRepository.findObjectByReferenceId(asteroidId);

            if (stored) {
                return stored.payload;
            }

            const object = await this.neoProvider.getById(asteroidId);
            await this.neoRepository.upsertObjects([this.toEntity(object)]);

            return object;
        });
    }

    async browse(page: number, size: number): Promise<NeoBrowseResponse> {
        return await this.cacheProvider.getOrSet<NeoBrowseResponse>(
            `neo:browse:${page}:${size}`,
            CACHE_TTL_SECONDS,
            async () => {
                const result = await this.neoProvider.browse(page, size);
                await this.neoRepository.upsertObjects(
                    (result.near_earth_objects ?? []).map((object) => this.toEntity(object)),
                );

                return result;
            },
        );
    }

    @ScheduledTask({ name: "neo:daily-feed", cron: "0 5 * * *" })
    async syncYesterdayFeed(): Promise<void> {
        const yesterday = toIsoDate(addDays(new Date(), -1));

        try {
            const feed = await this.neoProvider.getFeed(yesterday, yesterday);
            await this.persistFeed(feed);
            this.logger.log(`Feed NeoWs de ${yesterday} sincronizado (${feed.element_count} objeto(s)).`);
        } catch (error) {
            this.logger.warn(`Falha ao sincronizar o feed NeoWs de ${yesterday}: ${(error as Error).message}`);
        }
    }

    private async buildFeedFromDatabase(
        storedDays: Awaited<ReturnType<INeoRepository["findFeedDays"]>>,
    ): Promise<NeoFeedResponse> {
        const referenceIds = [...new Set(storedDays.flatMap((day) => day.neo_reference_ids))];
        const objects = await this.neoRepository.findObjectsByReferenceIds(referenceIds);
        const objectsById = new Map(objects.map((object) => [object.neo_reference_id, object.payload]));

        const nearEarthObjects: Record<string, NeoObject[]> = {};
        let elementCount = 0;

        for (const day of storedDays) {
            const dayObjects = day.neo_reference_ids
                .map((referenceId) => objectsById.get(referenceId))
                .filter((object): object is NeoObject => Boolean(object));

            nearEarthObjects[day.date] = dayObjects;
            elementCount += dayObjects.length;
        }

        return { element_count: elementCount, near_earth_objects: nearEarthObjects };
    }

    private async persistFeed(feed: NeoFeedResponse): Promise<void> {
        const objects: DeepPartial<NeoObjectEntity>[] = [];
        const days: DeepPartial<{ date: string; neo_reference_ids: string[]; element_count: number }>[] = [];

        for (const [date, dayObjects] of Object.entries(feed.near_earth_objects ?? {})) {
            days.push({
                date,
                neo_reference_ids: dayObjects.map((object) => object.neo_reference_id),
                element_count: dayObjects.length,
            });
            objects.push(...dayObjects.map((object) => this.toEntity(object)));
        }

        await this.neoRepository.upsertObjects(objects);
        await this.neoRepository.upsertFeedDays(days);
    }

    private toEntity(object: NeoObject): DeepPartial<NeoObjectEntity> {
        return {
            neo_reference_id: object.neo_reference_id,
            name: object.name,
            is_potentially_hazardous_asteroid: object.is_potentially_hazardous_asteroid,
            is_sentry_object: object.is_sentry_object,
            absolute_magnitude_h: object.absolute_magnitude_h ?? null,
            payload: object,
        };
    }
}
