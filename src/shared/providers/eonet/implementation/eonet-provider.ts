import { Inject, Injectable } from "@nestjs/common";
import { EnvConfigService } from "src/env-config/env-config.service";
import { UpstreamHttpProvider } from "src/shared/providers/base/upstream-http.provider";
import { HTTP_CLIENT_PROVIDER } from "src/shared/tokens";

import type { IHttpClientProvider } from "src/shared/providers/http/models/http-client-provider.interface";
import type { EonetEventsQuery, IEonetProvider } from "../models/eonet-provider.interface";
import type { EonetCategory, EonetCollection, EonetEvent, EonetSource } from "../models/eonet-response.interface";

@Injectable()
export class EonetProvider extends UpstreamHttpProvider implements IEonetProvider {
    protected readonly baseUrl = "https://eonet.gsfc.nasa.gov/api/v3";
    protected readonly context = "EONET";
    protected readonly requiresApiKey = false;

    constructor(@Inject(HTTP_CLIENT_PROVIDER) httpClient: IHttpClientProvider, envConfigService: EnvConfigService) {
        super(httpClient, envConfigService);
    }

    async getEvents(query: EonetEventsQuery): Promise<EonetEvent[]> {
        const collection = await this.request<EonetCollection<EonetEvent>>("/events", {
            status: query.status,
            category: query.category,
            days: query.days,
            limit: query.limit,
            source: query.source,
        });

        return collection.events ?? [];
    }

    async getCategories(): Promise<EonetCategory[]> {
        const collection = await this.request<EonetCollection<EonetCategory>>("/categories");
        return collection.categories ?? [];
    }

    async getSources(): Promise<EonetSource[]> {
        const collection = await this.request<EonetCollection<EonetSource>>("/sources");
        return collection.sources ?? [];
    }

    async getLayers(category?: string): Promise<unknown> {
        return await this.request<unknown>(category ? `/layers/${category}` : "/layers");
    }
}
