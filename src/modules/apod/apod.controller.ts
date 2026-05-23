import { Controller, Get, HttpCode, Param } from "@nestjs/common";
import { ApodService } from "./apod.service";

@Controller("apods")
export class ApodController {
    constructor(private readonly apodService: ApodService) {}

    @Get(":date")
    @HttpCode(200)
    findByDate(@Param("date") date: string) {
        return this.apodService.findByDate(new Date(date));
    }
    @Get("between/:startDate/:endDate")
    @HttpCode(200)
    findBetweenDates(@Param("startDate") startDate: string, @Param("endDate") endDate: string) {
        return this.apodService.findBetweenDates(new Date(startDate), new Date(endDate));
    }

    @Get("random/:quantity")
    @HttpCode(200)
    findRandom(@Param("quantity") quantity: number) {
        return this.apodService.findRandom(quantity);
    }
}
