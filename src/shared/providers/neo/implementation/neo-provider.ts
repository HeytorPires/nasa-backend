import { Inject, Injectable } from "@nestjs/common";
import { EnvConfigService } from "src/env-config/env-config.service";
import { UpstreamHttpProvider } from "src/shared/providers/base/upstream-http.provider";
import { HTTP_CLIENT_PROVIDER } from "src/shared/tokens";

import type { IHttpClientProvider } from "src/shared/providers/http/models/http-client-provider.interface";
import type { INeoProvider } from "../models/neo-provider.interface";
import type { NeoBrowseResponse, NeoFeedResponse, NeoObject } from "../models/neo-response.interface";

@Injectable()
export class NeoProvider extends UpstreamHttpProvider implements INeoProvider {
    protected readonly baseUrl = "https://api.nasa.gov/neo/rest/v1";
    protected readonly context = "NASA NeoWs";
    protected readonly requiresApiKey = true;

    constructor(@Inject(HTTP_CLIENT_PROVIDER) httpClient: IHttpClientProvider, envConfigService: EnvConfigService) {
        super(httpClient, envConfigService);
    }

    async getFeed(startDate: string, endDate: string): Promise<NeoFeedResponse> {
        return await this.request<NeoFeedResponse>("/feed", { start_date: startDate, end_date: endDate });
    }

    async getById(asteroidId: string): Promise<NeoObject> {
        return await this.request<NeoObject>(`/neo/${asteroidId}`);
    }

    async browse(page: number, size: number): Promise<NeoBrowseResponse> {
        return await this.request<NeoBrowseResponse>("/neo/browse", { page, size });
    }
}
