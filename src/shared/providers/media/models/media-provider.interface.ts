import type { MediaAssetResponse, MediaSearchResponse } from "./media-response.interface";

export interface MediaSearchQuery {
    q?: string;
    mediaType?: string;
    yearStart?: number;
    yearEnd?: number;
    center?: string;
    keywords?: string;
    page?: number;
    pageSize?: number;
}

export interface IMediaProvider {
    search(query: MediaSearchQuery): Promise<MediaSearchResponse>;
    getAsset(nasaId: string): Promise<MediaAssetResponse>;
    getMetadataLocation(nasaId: string): Promise<MediaAssetResponse>;
    getCaptionsLocation(nasaId: string): Promise<MediaAssetResponse>;
}
