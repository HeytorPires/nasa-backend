import { Inject, Injectable } from "@nestjs/common";
import { EnvConfigService } from "src/env-config/env-config.service";
import { UpstreamHttpProvider } from "src/shared/providers/base/upstream-http.provider";
import { HTTP_CLIENT_PROVIDER } from "src/shared/tokens";

import type { IHttpClientProvider } from "src/shared/providers/http/models/http-client-provider.interface";
import type { ISsdProvider } from "../models/ssd-provider.interface";
import type {
    SsdCadQuery,
    SsdFireballQuery,
    SsdSentryQuery,
    SsdSentryResponse,
    SsdTableResponse,
} from "../models/ssd-response.interface";

@Injectable()
export class SsdProvider extends UpstreamHttpProvider implements ISsdProvider {
    protected readonly baseUrl = "https://ssd-api.jpl.nasa.gov";
    protected readonly context = "JPL SSD/CNEOS";
    protected readonly requiresApiKey = false;

    constructor(@Inject(HTTP_CLIENT_PROVIDER) httpClient: IHttpClientProvider, envConfigService: EnvConfigService) {
        super(httpClient, envConfigService);
    }

    async getCloseApproaches(query: SsdCadQuery): Promise<SsdTableResponse> {
        return await this.request<SsdTableResponse>("/cad.api", {
            "date-min": query.dateMin,
            "date-max": query.dateMax,
            "dist-max": query.distMax,
            body: query.body,
            sort: query.sort,
            limit: query.limit,
        });
    }

    async getFireballs(query: SsdFireballQuery): Promise<SsdTableResponse> {
        return await this.request<SsdTableResponse>("/fireball.api", {
            "date-min": query.dateMin,
            "date-max": query.dateMax,
            limit: query.limit,
        });
    }

    async getSentry(query: SsdSentryQuery): Promise<SsdSentryResponse> {
        return await this.request<SsdSentryResponse>("/sentry.api", {
            des: query.des,
            "ip-min": query.ipMin,
            limit: query.limit,
        });
    }

    async getNhats(): Promise<SsdTableResponse> {
        return await this.request<SsdTableResponse>("/nhats.api");
    }

    async getScout(): Promise<unknown> {
        return await this.request<unknown>("/scout.api");
    }

    async getMissionDesign(params: Record<string, string | number>): Promise<unknown> {
        return await this.request<unknown>("/mdesign.api", params);
    }
}
