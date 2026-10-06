import type { NeoBrowseResponse, NeoFeedResponse, NeoObject } from "./neo-response.interface";

export interface INeoProvider {
    getFeed(startDate: string, endDate: string): Promise<NeoFeedResponse>;
    getById(asteroidId: string): Promise<NeoObject>;
    browse(page: number, size: number): Promise<NeoBrowseResponse>;
}
