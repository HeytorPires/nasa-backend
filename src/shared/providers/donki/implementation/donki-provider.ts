import { Inject, Injectable } from "@nestjs/common";
import { EnvConfigService } from "src/env-config/env-config.service";
import { UpstreamHttpProvider } from "src/shared/providers/base/upstream-http.provider";
import { HTTP_CLIENT_PROVIDER } from "src/shared/tokens";
import { DONKI_EVENT_PATHS } from "../models/donki-response.interface";

import type { IHttpClientProvider } from "src/shared/providers/http/models/http-client-provider.interface";
import type { IDonkiProvider } from "../models/donki-provider.interface";
import type { DonkiEvent, DonkiEventType, DonkiQuery } from "../models/donki-response.interface";

@Injectable()
export class DonkiProvider extends UpstreamHttpProvider implements IDonkiProvider {
    protected readonly baseUrl = "https://api.nasa.gov/DONKI";
    protected readonly context = "NASA DONKI";
    protected readonly requiresApiKey = true;

    constructor(@Inject(HTTP_CLIENT_PROVIDER) httpClient: IHttpClientProvider, envConfigService: EnvConfigService) {
        super(httpClient, envConfigService);
    }

    async getEvents(eventType: DonkiEventType, query: DonkiQuery): Promise<DonkiEvent[]> {
        const events = await this.request<DonkiEvent[] | null>(`/${DONKI_EVENT_PATHS[eventType]}`, {
            startDate: query.startDate,
            endDate: query.endDate,
            mostAccurateOnly: query.mostAccurateOnly,
            speed: query.speed,
            halfAngle: query.halfAngle,
            catalog: query.catalog,
            location: query.location,
            type: query.type,
        });

        return Array.isArray(events) ? events : [];
    }
}
