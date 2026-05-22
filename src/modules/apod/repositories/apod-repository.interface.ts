import { ApodEntity } from "../entities/apod.entity";

export interface IApodRepository {
    findByDate(date: Date): Promise<ApodEntity | null>;
}
