import { Injectable, NotFoundException } from "@nestjs/common";
import { ApodDto } from "../dtos/apod.dto";

@Injectable()
export class FindApodUseCase {
    constructor() {}

    async execute(date: string): Promise<ApodDto> {
        // TODO: Implement APOD fetching without database
        throw new NotFoundException("Apod not found");
    }
}
