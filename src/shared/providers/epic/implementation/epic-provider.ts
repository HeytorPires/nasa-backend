import { Inject, Injectable } from "@nestjs/common";
import { EnvConfigService } from "src/env-config/env-config.service";
import { UpstreamHttpProvider } from "src/shared/providers/base/upstream-http.provider";
import { HTTP_CLIENT_PROVIDER } from "src/shared/tokens";

import type { IHttpClientProvider } from "src/shared/providers/http/models/http-client-provider.interface";
import type { IEpicProvider } from "../models/epic-provider.interface";
import type { EpicAvailableDate, EpicCollection, EpicImage } from "../models/epic-response.interface";

const ARCHIVE_BASE_URL = "https://epic.gsfc.nasa.gov/archive";

@Injectable()
export class EpicProvider extends UpstreamHttpProvider implements IEpicProvider {
    protected readonly baseUrl = "https://epic.gsfc.nasa.gov/api";
    protected readonly context = "NASA EPIC";
    protected readonly requiresApiKey = false;

    constructor(@Inject(HTTP_CLIENT_PROVIDER) httpClient: IHttpClientProvider, envConfigService: EnvConfigService) {
        super(httpClient, envConfigService);
    }

    async getLatest(collection: EpicCollection): Promise<EpicImage[]> {
        return await this.request<EpicImage[]>(`/${collection}`);
    }

    async getByDate(collection: EpicCollection, date: string): Promise<EpicImage[]> {
        return await this.request<EpicImage[]>(`/${collection}/date/${date}`);
    }

    async getAvailableDates(collection: EpicCollection): Promise<string[]> {
        const dates = await this.request<EpicAvailableDate[]>(`/${collection}/all`);
        return dates.map((entry) => entry.date);
    }

    buildArchiveUrl(collection: EpicCollection, date: string, image: string): string {
        const [year, month, day] = date.split("-");
        return `${ARCHIVE_BASE_URL}/${collection}/${year}/${month}/${day}/png/${image}.png`;
    }
}
