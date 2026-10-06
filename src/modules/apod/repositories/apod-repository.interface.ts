import type { DeepPartial } from "typeorm";
import { ApodEntity } from "../entities/apod.entity";

export interface IApodRepository {
    findByDate(date: string): Promise<ApodEntity | null>;
    findBetweenDates(startDate: string, endDate: string): Promise<ApodEntity[]>;
    countBetweenDates(startDate: string, endDate: string): Promise<number>;
    upsertMany(apods: DeepPartial<ApodEntity>[]): Promise<void>;
}
