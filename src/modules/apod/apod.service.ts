import { Inject, Injectable } from "@nestjs/common";
import { IApodRepository } from "./repositories/apod-repository.interface";
import { INasaProvider } from "src/shared/providers/nasa/models/nasa-provider.interface";
import ApodResponse from "src/shared/providers/nasa/models/apod-response.interface";

@Injectable()
export class ApodService {
    constructor(
        @Inject("INasaProvider") private readonly nasaApiService: INasaProvider,
        @Inject("IApodRepository") private readonly apodRepository: IApodRepository,
    ) {}

    private countDaysBetweenDates(startDate: Date, endDate: Date): number {
        const timeDiff = endDate.getTime() - startDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    }

    private async resolveCreateOrUpdate(apodData: ApodResponse) {
        const existingApod = await this.apodRepository.findByDate(
            new Date(new Date(apodData.date).toISOString().split("T")[0]),
        );
        if (!existingApod) {
            return await this.apodRepository.create({
                date: new Date(apodData.date),
                title: apodData.title,
                explanation: apodData.explanation,
                url: apodData.url,
                media_type: apodData.media_type,
                service_version: apodData.service_version,
                created_at: new Date(),
            });
        }
    }

    async findByDate(date: Date) {
        const apod = await this.apodRepository.findByDate(date);

        if (apod) {
            return apod;
        }

        const apodFromApi = await this.nasaApiService.getApod(`date=${date.toISOString().split("T")[0]}`);

        if (apodFromApi) {
            await this.apodRepository.create({
                date: new Date(apodFromApi.date),
                title: apodFromApi.title,
                explanation: apodFromApi.explanation,
                url: apodFromApi.url,
                media_type: apodFromApi.media_type,
                service_version: apodFromApi.service_version,
                created_at: new Date(),
            });
            return apodFromApi;
        }

        return null;
    }

    async findBetweenDates(startDate: Date, endDate: Date) {
        const dayBetween = this.countDaysBetweenDates(startDate, endDate);
        const countInDb = await this.apodRepository.countBetweenDates(startDate, endDate);

        if (countInDb === dayBetween) {
            return await this.apodRepository.findBetweenDates(startDate, endDate);
        }

        const apodFromApi = await this.nasaApiService.getApodBetweenDates(
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
        );

        for (const apodData of apodFromApi) {
            await this.resolveCreateOrUpdate(apodData);
        }

        return apodFromApi;
    }

    async findRandom(quantity: number) {
        const apodFromApi = await this.nasaApiService.getRandomApod(quantity);

        for (const apodData of apodFromApi) {
            await this.resolveCreateOrUpdate(apodData);
        }

        return apodFromApi;
    }
}
