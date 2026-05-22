import { Module } from "@nestjs/common";
import { ApodService } from "./apod.service";
import { ApodController } from "./apod.controller";

@Module({
    controllers: [ApodController],
    providers: [ApodService],
})
export class ApodModule {}
