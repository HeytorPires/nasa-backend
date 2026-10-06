import type { DeepPartial } from "typeorm";
import { TleRecordEntity } from "../entities/tle-record.entity";

export interface ITleRepository {
    findLatestBySatelliteId(satelliteId: number): Promise<TleRecordEntity | null>;
    findTrackedSatelliteIds(limit: number): Promise<number[]>;
    upsertMany(records: DeepPartial<TleRecordEntity>[]): Promise<void>;
}
