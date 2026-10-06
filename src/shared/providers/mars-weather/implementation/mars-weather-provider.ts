import { Inject, Injectable } from "@nestjs/common";
import { EnvConfigService } from "src/env-config/env-config.service";
import { UpstreamHttpProvider } from "src/shared/providers/base/upstream-http.provider";
import { HTTP_CLIENT_PROVIDER } from "src/shared/tokens";

import type { IHttpClientProvider } from "src/shared/providers/http/models/http-client-provider.interface";
import type { IMarsWeatherProvider } from "../models/mars-weather-provider.interface";
import type { MarsWeatherResponse } from "../models/mars-weather-response.interface";

@Injectable()
export class MarsWeatherProvider extends UpstreamHttpProvider implements IMarsWeatherProvider {
    protected readonly baseUrl = "https://api.nasa.gov";
    protected readonly context = "NASA InSight Mars Weather";
    protected readonly requiresApiKey = true;

    constructor(@Inject(HTTP_CLIENT_PROVIDER) httpClient: IHttpClientProvider, envConfigService: EnvConfigService) {
        super(httpClient, envConfigService);
    }

    async getLatest(): Promise<MarsWeatherResponse> {
        return await this.request<MarsWeatherResponse>("/insight_weather/", { feedtype: "json", ver: "1.0" });
    }
}
