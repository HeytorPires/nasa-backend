import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { EnvConfigService } from "src/env-config/env-config.service";
import { UpstreamHttpProvider } from "src/shared/providers/base/upstream-http.provider";
import { HTTP_CLIENT_PROVIDER } from "src/shared/tokens";
import { addDays, toIsoDate } from "src/shared/utils/date.util";

import type { IHttpClientProvider } from "src/shared/providers/http/models/http-client-provider.interface";
import type { ApodResponse } from "../models/apod-response.interface";
import type { INasaProvider } from "../models/nasa-provider.interface";
import type { WordPressApodPayload } from "../models/wordpress-apod.interface";
import { mapWordPressApod } from "../mappers/apod.mapper";

const FIRST_APOD_DATE = new Date("1995-06-16T00:00:00Z");

const CONCURRENCY = 5;

@Injectable()
export class ApodWordPressProvider extends UpstreamHttpProvider implements INasaProvider {
    protected readonly baseUrl = "https://science.nasa.gov/wp-json/wp/v2";
    protected readonly context = "NASA APOD (WordPress)";
    protected readonly requiresApiKey = false;

    private readonly logger = new Logger(ApodWordPressProvider.name);

    constructor(@Inject(HTTP_CLIENT_PROVIDER) httpClient: IHttpClientProvider, envConfigService: EnvConfigService) {
        super(httpClient, envConfigService);
    }

    async getApod(date: string): Promise<ApodResponse | null> {
        try {
            const payload = await this.request<WordPressApodPayload>(`/apod-basic/${this.toWordPressSlug(date)}`);
            return mapWordPressApod(payload);
        } catch (error) {
            if (error instanceof NotFoundException) {
                return null;
            }
            throw error;
        }
    }

    async getApodBetweenDates(startDate: string, endDate: string): Promise<ApodResponse[]> {
        const dates = this.listDates(new Date(`${startDate}T00:00:00Z`), new Date(`${endDate}T00:00:00Z`));
        const results = await this.fetchMany(dates);

        return results.sort((a, b) => a.date.localeCompare(b.date));
    }

    async getRandomApod(quantity: number): Promise<ApodResponse[]> {
        const dates = this.pickRandomDates(quantity);
        return await this.fetchMany(dates);
    }

    private toWordPressSlug(date: string): string {
        const [year, month, day] = date.split("-");
        return `${year.slice(2)}${month}${day}`;
    }

    private listDates(startDate: Date, endDate: Date): string[] {
        const dates: string[] = [];

        for (let current = startDate; current <= endDate; current = addDays(current, 1)) {
            dates.push(toIsoDate(current));
        }

        return dates;
    }

    private pickRandomDates(quantity: number): string[] {
        const firstDay = FIRST_APOD_DATE.getTime();
        const span = Date.now() - firstDay;
        const dates = new Set<string>();

        for (let attempts = 0; dates.size < quantity && attempts < quantity * 10; attempts++) {
            dates.add(toIsoDate(new Date(firstDay + Math.floor(Math.random() * span))));
        }

        return [...dates];
    }

    private async fetchMany(dates: string[]): Promise<ApodResponse[]> {
        const results: ApodResponse[] = [];

        for (let index = 0; index < dates.length; index += CONCURRENCY) {
            const batch = dates.slice(index, index + CONCURRENCY);
            const settled = await Promise.all(batch.map((date) => this.getApod(date)));

            for (const apod of settled) {
                if (apod) {
                    results.push(apod);
                }
            }
        }

        if (results.length < dates.length) {
            this.logger.debug(`${dates.length - results.length} data(s) sem APOD publicado foram ignoradas.`);
        }

        return results;
    }
}
