import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { INasaProvider } from "src/shared/providers/nasa/models/nasa-provider.interface";
import { ScheduledTask } from "src/shared/providers/scheduler/decorators/scheduled-task.decorator";
import { APOD_REPOSITORY, CACHE_PROVIDER, NASA_PROVIDER } from "src/shared/tokens";
import { countDaysBetween, toIsoDate } from "src/shared/utils/date.util";
import { IApodRepository } from "./repositories/apod-repository.interface";

import type { DeepPartial } from "typeorm";
import type { ApodResponse } from "src/shared/providers/nasa/models/apod-response.interface";
import type { ApodEntity } from "./entities/apod.entity";

const CACHE_TTL_SECONDS = 60 * 5;

@Injectable()
export class ApodService {
    private readonly logger = new Logger(ApodService.name);

    constructor(
        @Inject(NASA_PROVIDER) private readonly nasaProvider: INasaProvider,
        @Inject(APOD_REPOSITORY) private readonly apodRepository: IApodRepository,
        @Inject(CACHE_PROVIDER) private readonly cacheProvider: ICacheProvider,
    ) {}

    async findByDate(date: string): Promise<ApodResponse> {
        const apod = await this.cacheProvider.getOrSet<ApodResponse | null>(
            `apod:${date}`,
            CACHE_TTL_SECONDS,
            async () => {
                const stored = await this.apodRepository.findByDate(date);

                if (stored) {
                    return this.toResponse(stored);
                }

                const fromApi = await this.nasaProvider.getApod(date);

                if (!fromApi) {
                    return null;
                }

                await this.apodRepository.upsertMany([this.toEntity(fromApi)]);
                return fromApi;
            },
        );

        if (!apod) {
            throw new NotFoundException(`Nenhum APOD publicado em ${date}.`);
        }

        return apod;
    }

    async findBetweenDates(startDate: string, endDate: string): Promise<ApodResponse[]> {
        const expectedDays = countDaysBetween(new Date(startDate), new Date(endDate));
        const storedCount = await this.apodRepository.countBetweenDates(startDate, endDate);

        if (storedCount === expectedDays) {
            const stored = await this.apodRepository.findBetweenDates(startDate, endDate);
            return stored.map((apod) => this.toResponse(apod));
        }

        const fromApi = await this.nasaProvider.getApodBetweenDates(startDate, endDate);

        if (fromApi.length > 0) {
            await this.apodRepository.upsertMany(fromApi.map((apod) => this.toEntity(apod)));
        }

        return fromApi;
    }

    async findRandom(quantity: number): Promise<ApodResponse[]> {
        const fromApi = await this.nasaProvider.getRandomApod(quantity);

        if (fromApi.length > 0) {
            await this.apodRepository.upsertMany(fromApi.map((apod) => this.toEntity(apod)));
        }

        return fromApi;
    }

    @ScheduledTask({ name: "apod:daily", cron: "0 6 * * *" })
    async syncToday(): Promise<void> {
        const today = toIsoDate(new Date());

        try {
            await this.findByDate(today);
            this.logger.log(`APOD de ${today} sincronizado.`);
        } catch (error) {
            this.logger.warn(`Não foi possível sincronizar o APOD de ${today}: ${(error as Error).message}`);
        }
    }

    private toEntity(apod: ApodResponse): DeepPartial<ApodEntity> {
        return {
            date: apod.date,
            title: apod.title,
            explanation: apod.explanation,
            url: apod.url,
            media_type: apod.media_type,
            service_version: apod.service_version ?? null,
            hdurl: apod.hdurl ?? null,
            permalink: apod.permalink ?? null,
            copyright: apod.copyright ?? null,
            alt: apod.alt ?? null,
        };
    }

    private toResponse(apod: ApodEntity): ApodResponse {
        return {
            date: apod.date,
            title: apod.title,
            explanation: apod.explanation,
            url: apod.url,
            media_type: apod.media_type,
            service_version: apod.service_version ?? undefined,
            hdurl: apod.hdurl ?? undefined,
            permalink: apod.permalink ?? undefined,
            copyright: apod.copyright ?? undefined,
            alt: apod.alt ?? undefined,
        };
    }
}
