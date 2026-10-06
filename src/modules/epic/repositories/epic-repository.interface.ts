import type { DeepPartial } from "typeorm";
import { EpicImageEntity } from "../entities/epic-image.entity";

export interface IEpicRepository {
    findByDate(collection: string, date: string): Promise<EpicImageEntity[]>;
    findLatestDate(collection: string): Promise<string | null>;
    findAvailableDates(collection: string): Promise<string[]>;
    upsertMany(images: DeepPartial<EpicImageEntity>[]): Promise<void>;
}
