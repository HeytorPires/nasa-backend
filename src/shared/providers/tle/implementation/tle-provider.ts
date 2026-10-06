import { Inject, Injectable } from "@nestjs/common";
import { EnvConfigService } from "src/env-config/env-config.service";
import { UpstreamHttpProvider } from "src/shared/providers/base/upstream-http.provider";
import { HTTP_CLIENT_PROVIDER } from "src/shared/tokens";

import type { IHttpClientProvider } from "src/shared/providers/http/models/http-client-provider.interface";
import type { ITleProvider } from "../models/tle-provider.interface";
import type { TleCollection, TleRecord } from "../models/tle-response.interface";

@Injectable()
export class TleProvider extends UpstreamHttpProvider implements ITleProvider {
    protected readonly baseUrl = "https://tle.ivanstanojevic.me/api";
    protected readonly context = "TLE API";
    protected readonly requiresApiKey = false;

    constructor(@Inject(HTTP_CLIENT_PROVIDER) httpClient: IHttpClientProvider, envConfigService: EnvConfigService) {
        super(httpClient, envConfigService);
    }

    async search(search: string | undefined, page: number, pageSize: number): Promise<TleCollection> {
        return await this.request<TleCollection>("/tle", { search, page, "page-size": pageSize });
    }

    async getBySatelliteId(satelliteId: number): Promise<TleRecord> {
        return await this.request<TleRecord>(`/tle/${satelliteId}`);
    }
}
