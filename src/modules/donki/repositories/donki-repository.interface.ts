import type { DeepPartial } from "typeorm";
import { DonkiEventEntity } from "../entities/donki-event.entity";

export interface IDonkiRepository {
    findByTypeAndRange(eventType: string, startDate: string, endDate: string): Promise<DonkiEventEntity[]>;
    upsertMany(events: DeepPartial<DonkiEventEntity>[]): Promise<void>;
}
