import type { DeepPartial } from "typeorm";
import { EonetEventEntity } from "../entities/eonet-event.entity";

export interface EonetEventFilters {
    status?: string;
    category?: string;
    days?: number;
    limit?: number;
}

export interface IEonetRepository {
    findEvents(filters: EonetEventFilters): Promise<EonetEventEntity[]>;
    findByEonetId(eonetId: string): Promise<EonetEventEntity | null>;
    upsertMany(events: DeepPartial<EonetEventEntity>[]): Promise<void>;
}
