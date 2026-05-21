import { Module } from "@nestjs/common";
import { ApodController } from "./controller/apod.controller";
import { FindApodUseCase } from "./useCases/find-apod.use-case";

@Module({
    imports: [],
    controllers: [ApodController],
    providers: [FindApodUseCase],
})
export class ApodModule {}
