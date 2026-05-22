import { Inject, Injectable } from "@nestjs/common";
import { IApodRepository } from "./repositories/apod-repository.interface";

@Injectable()
export class ApodService {
    constructor(@Inject("IApodRepository") private readonly apodRepository: IApodRepository) {}
    async findByDate(date: Date) {
        return await this.apodRepository.findByDate(date);
    }
}
