import { Controller, Get, HttpCode, Param } from "@nestjs/common";
import { ApodService } from "./apod.service";

@Controller("apod")
export class ApodController {
    constructor(private readonly apodService: ApodService) {}

    @Get(":date")
    @HttpCode(200)
    findByDate(@Param("date") date: string) {
        console.log(date);
        return this.apodService.findByDate(new Date(date));
    }
}
