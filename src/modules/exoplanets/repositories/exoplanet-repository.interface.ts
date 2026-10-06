import type { DeepPartial } from "typeorm";
import { ExoplanetEntity } from "../entities/exoplanet.entity";

export interface IExoplanetRepository {
    findByName(plName: string): Promise<ExoplanetEntity | null>;
    upsertMany(planets: DeepPartial<ExoplanetEntity>[]): Promise<void>;
}
