import { ApodEntity } from "../entities/apod.entity";

export interface IApodRepository {
    findByDate(date: Date): Promise<ApodEntity | null>;
    create({
        date,
        title,
        explanation,
        url,
        media_type,
        service_version,
        created_at,
    }: Partial<ApodEntity>): Promise<ApodEntity>;
}
