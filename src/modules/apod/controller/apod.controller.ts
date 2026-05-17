import { Controller, Get, Query } from "@nestjs/common";
import { FindApodDto } from "../dtos/find-apod.dto.ts";
import { ApodService } from "../useCases/find-apod.use-case.js";

@Controller("apod")
export class ApodController {
    constructor(private readonly apodService: ApodService) {}

    // @Get()
    // findAll() {
    //     return this.apodService.findAll();
    // }

    @Get()
    findOne(@Query() params: FindApodDto) {
        return console.log(params);
    }
}
