import type { DeepPartial } from "typeorm";
import { TechTransferItemEntity } from "../entities/tech-transfer-item.entity";

export interface ITechTransferRepository {
    upsertMany(items: DeepPartial<TechTransferItemEntity>[]): Promise<void>;
}
