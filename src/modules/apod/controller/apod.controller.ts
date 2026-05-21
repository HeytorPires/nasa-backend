import { Controller, Get, Param } from "@nestjs/common";
import { FindApodUseCase } from "../useCases/find-apod.use-case.js";

@Controller("apod")
export class ApodController {
    constructor(private readonly apodService: FindApodUseCase) {}

    @Get(":date")
    findOne(@Param("date") date: string) {
        console.log(this.apodService.execute(date));
        return;
    }

    // @Get("around")
    // findAround(@Query() query: FindApodDto) {
    //     console.log(this.apodService.execute(query.date));
    //     return console.log(query);
    // }
}
