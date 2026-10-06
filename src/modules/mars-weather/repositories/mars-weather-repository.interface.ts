import type { DeepPartial } from "typeorm";
import { MarsWeatherSolEntity } from "../entities/mars-weather-sol.entity";

export interface IMarsWeatherRepository {
    findLatest(limit: number): Promise<MarsWeatherSolEntity[]>;
    findBySol(sol: number): Promise<MarsWeatherSolEntity | null>;
    upsertMany(sols: DeepPartial<MarsWeatherSolEntity>[]): Promise<void>;
}
