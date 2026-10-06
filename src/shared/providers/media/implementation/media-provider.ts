import { Inject, Injectable } from "@nestjs/common";
import { EnvConfigService } from "src/env-config/env-config.service";
import { UpstreamHttpProvider } from "src/shared/providers/base/upstream-http.provider";
import { HTTP_CLIENT_PROVIDER } from "src/shared/tokens";

import type { IHttpClientProvider } from "src/shared/providers/http/models/http-client-provider.interface";
import type { IMediaProvider, MediaSearchQuery } from "../models/media-provider.interface";
import type { MediaAssetResponse, MediaSearchResponse } from "../models/media-response.interface";

@Injectable()
export class MediaProvider extends UpstreamHttpProvider implements IMediaProvider {
    protected readonly baseUrl = "https://images-api.nasa.gov";
    protected readonly context = "NASA Image and Video Library";
    protected readonly requiresApiKey = false;

    constructor(@Inject(HTTP_CLIENT_PROVIDER) httpClient: IHttpClientProvider, envConfigService: EnvConfigService) {
        super(httpClient, envConfigService);
    }

    async search(query: MediaSearchQuery): Promise<MediaSearchResponse> {
        return await this.request<MediaSearchResponse>("/search", {
            q: query.q,
            media_type: query.mediaType,
            year_start: query.yearStart,
            year_end: query.yearEnd,
            center: query.center,
            keywords: query.keywords,
            page: query.page,
            page_size: query.pageSize,
        });
    }

    async getAsset(nasaId: string): Promise<MediaAssetResponse> {
        return await this.request<MediaAssetResponse>(`/asset/${encodeURIComponent(nasaId)}`);
    }

    async getMetadataLocation(nasaId: string): Promise<MediaAssetResponse> {
        return await this.request<MediaAssetResponse>(`/metadata/${encodeURIComponent(nasaId)}`);
    }

    async getCaptionsLocation(nasaId: string): Promise<MediaAssetResponse> {
        return await this.request<MediaAssetResponse>(`/captions/${encodeURIComponent(nasaId)}`);
    }
}
