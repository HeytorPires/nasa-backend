import { Controller, Get, Param } from "@nestjs/common";
import { ApodService } from "./apod.service";

@Controller("apod")
export class ApodController {
    constructor(private readonly apodService: ApodService) {}

    @Get()
    findByDate(@Param("date") date: string) {
        return this.apodService.findByDate(new Date(date));
    }
}
