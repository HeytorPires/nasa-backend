import type { DeepPartial } from "typeorm";
import { NeoFeedDayEntity } from "../entities/neo-feed-day.entity";
import { NeoObjectEntity } from "../entities/neo-object.entity";

export interface INeoRepository {
    findObjectByReferenceId(referenceId: string): Promise<NeoObjectEntity | null>;
    findObjectsByReferenceIds(referenceIds: string[]): Promise<NeoObjectEntity[]>;
    upsertObjects(objects: DeepPartial<NeoObjectEntity>[]): Promise<void>;

    findFeedDays(startDate: string, endDate: string): Promise<NeoFeedDayEntity[]>;
    upsertFeedDays(days: DeepPartial<NeoFeedDayEntity>[]): Promise<void>;
}
