import { Inject, Injectable, Logger } from "@nestjs/common";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { IDonkiProvider } from "src/shared/providers/donki/models/donki-provider.interface";
import { DONKI_EVENT_TYPES } from "src/shared/providers/donki/models/donki-response.interface";
import { ScheduledTask } from "src/shared/providers/scheduler/decorators/scheduled-task.decorator";
import { CACHE_PROVIDER, DONKI_PROVIDER, DONKI_REPOSITORY } from "src/shared/tokens";
import { addDays, toIsoDate } from "src/shared/utils/date.util";
import { IDonkiRepository } from "./repositories/donki-repository.interface";

import type { DeepPartial } from "typeorm";
import type {
    DonkiEvent,
    DonkiEventType,
    DonkiQuery,
} from "src/shared/providers/donki/models/donki-response.interface";
import type { DonkiEventEntity } from "./entities/donki-event.entity";

const CACHE_TTL_SECONDS = 60 * 60;
const SYNC_WINDOW_DAYS = 7;

const EVENT_FIELDS: Record<DonkiEventType, { id: string; time: string }> = {
    cme: { id: "activityID", time: "startTime" },
    "cme-analysis": { id: "associatedCMEID", time: "time21_5" },
    gst: { id: "gstID", time: "startTime" },
    ips: { id: "activityID", time: "eventTime" },
    flr: { id: "flrID", time: "beginTime" },
    sep: { id: "sepID", time: "eventTime" },
    mpc: { id: "mpcID", time: "eventTime" },
    rbe: { id: "rbeID", time: "eventTime" },
    hss: { id: "hssID", time: "eventTime" },
    "wsa-enlil": { id: "simulationID", time: "modelCompletionTime" },
    notifications: { id: "messageID", time: "messageIssueTime" },
};

@Injectable()
export class DonkiService {
    private readonly logger = new Logger(DonkiService.name);

    constructor(
        @Inject(DONKI_PROVIDER) private readonly donkiProvider: IDonkiProvider,
        @Inject(DONKI_REPOSITORY) private readonly donkiRepository: IDonkiRepository,
        @Inject(CACHE_PROVIDER) private readonly cacheProvider: ICacheProvider,
    ) {}

    async findEvents(eventType: DonkiEventType, query: DonkiQuery): Promise<DonkiEvent[]> {
        const startDate = query.startDate ?? toIsoDate(addDays(new Date(), -30));
        const endDate = query.endDate ?? toIsoDate(new Date());
        const cacheKey = `donki:${eventType}:${startDate}:${endDate}:${this.extraFiltersKey(query)}`;

        return await this.cacheProvider.getOrSet<DonkiEvent[]>(cacheKey, CACHE_TTL_SECONDS, async () => {
            if (!this.hasExtraFilters(query)) {
                const stored = await this.donkiRepository.findByTypeAndRange(eventType, startDate, endDate);

                if (stored.length > 0) {
                    return stored.map((event) => event.payload);
                }
            }

            const events = await this.donkiProvider.getEvents(eventType, { ...query, startDate, endDate });
            await this.persist(eventType, events);

            return events;
        });
    }

    @ScheduledTask({ name: "donki:daily", cron: "0 7 * * *" })
    async syncRecentEvents(): Promise<void> {
        const startDate = toIsoDate(addDays(new Date(), -SYNC_WINDOW_DAYS));
        const endDate = toIsoDate(new Date());

        for (const eventType of DONKI_EVENT_TYPES) {
            try {
                const events = await this.donkiProvider.getEvents(eventType, { startDate, endDate });
                await this.persist(eventType, events);
                this.logger.log(`DONKI ${eventType}: ${events.length} evento(s) sincronizado(s).`);
            } catch (error) {
                this.logger.warn(`Falha ao sincronizar DONKI ${eventType}: ${(error as Error).message}`);
            }
        }
    }

    private async persist(eventType: DonkiEventType, events: DonkiEvent[]): Promise<void> {
        const entities = events
            .map((event) => this.toEntity(eventType, event))
            .filter((entity): entity is DeepPartial<DonkiEventEntity> => entity !== null);

        if (entities.length === 0) {
            return;
        }

        await this.donkiRepository.upsertMany(entities);
    }

    private toEntity(eventType: DonkiEventType, event: DonkiEvent): DeepPartial<DonkiEventEntity> | null {
        const fields = EVENT_FIELDS[eventType];
        const activityId = event[fields.id];

        if (typeof activityId !== "string" || activityId.length === 0) {
            return null;
        }

        const rawTime = event[fields.time];
        const eventTime = typeof rawTime === "string" ? new Date(rawTime) : null;

        return {
            event_type: eventType,
            activity_id: activityId,
            event_time: eventTime && !Number.isNaN(eventTime.getTime()) ? eventTime : null,
            payload: event,
        };
    }

    private hasExtraFilters(query: DonkiQuery): boolean {
        return (
            query.mostAccurateOnly !== undefined ||
            query.speed !== undefined ||
            query.halfAngle !== undefined ||
            query.catalog !== undefined ||
            query.location !== undefined ||
            query.type !== undefined
        );
    }

    private extraFiltersKey(query: DonkiQuery): string {
        return [
            query.mostAccurateOnly ?? "",
            query.speed ?? "",
            query.halfAngle ?? "",
            query.catalog ?? "",
            query.location ?? "",
            query.type ?? "",
        ].join("|");
    }
}
