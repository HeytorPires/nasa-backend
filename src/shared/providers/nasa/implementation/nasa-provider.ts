import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EnvConfigService } from "src/env-config/env-config.service";
import { UpstreamHttpProvider } from "src/shared/providers/base/upstream-http.provider";
import { HTTP_CLIENT_PROVIDER } from "src/shared/tokens";

import type { IHttpClientProvider } from "src/shared/providers/http/models/http-client-provider.interface";
import type { ApodResponse } from "../models/apod-response.interface";
import type { INasaProvider } from "../models/nasa-provider.interface";

@Injectable()
export class NasaProvider extends UpstreamHttpProvider implements INasaProvider {
    protected readonly baseUrl = "https://api.nasa.gov";
    protected readonly context = "NASA APOD (legado)";
    protected readonly requiresApiKey = true;

    constructor(@Inject(HTTP_CLIENT_PROVIDER) httpClient: IHttpClientProvider, envConfigService: EnvConfigService) {
        super(httpClient, envConfigService);
    }

    async getApod(date: string): Promise<ApodResponse | null> {
        try {
            return await this.request<ApodResponse>("/planetary/apod", { date });
        } catch (error) {
            if (error instanceof NotFoundException) {
                return null;
            }
            throw error;
        }
    }

    async getApodBetweenDates(startDate: string, endDate: string): Promise<ApodResponse[]> {
        return await this.request<ApodResponse[]>("/planetary/apod", {
            start_date: startDate,
            end_date: endDate,
        });
    }

    async getRandomApod(quantity: number): Promise<ApodResponse[]> {
        return await this.request<ApodResponse[]>("/planetary/apod", { count: quantity });
    }
}
