import type { ExoplanetQuery, ExoplanetRow } from "./exoplanet-response.interface";

export interface IExoplanetProvider {
    query(query: ExoplanetQuery): Promise<ExoplanetRow[]>;
}
