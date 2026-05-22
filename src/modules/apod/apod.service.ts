import { Inject, Injectable } from "@nestjs/common";
import { IApodRepository } from "./repositories/apod-repository.interface";
import { INasaProvider } from "src/shared/providers/nasa/models/nasa-provider.interface";

@Injectable()
export class ApodService {
    constructor(
        @Inject("INasaProvider") private readonly nasaApiService: INasaProvider,
        @Inject("IApodRepository") private readonly apodRepository: IApodRepository,
    ) {}
    async findByDate(date: Date) {
        console.log(date);
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
}
