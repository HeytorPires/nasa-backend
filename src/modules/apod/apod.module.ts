import { Module } from "@nestjs/common";
import { ApodController } from "./controller/apod.controller";

@Module({
    controllers: [ApodController],
    providers: [],
})
export class ApodModule {}
