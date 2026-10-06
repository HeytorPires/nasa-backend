import type { TleCollection, TleRecord } from "./tle-response.interface";

export interface ITleProvider {
    search(search: string | undefined, page: number, pageSize: number): Promise<TleCollection>;
    getBySatelliteId(satelliteId: number): Promise<TleRecord>;
}
