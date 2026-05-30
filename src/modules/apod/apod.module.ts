import { Module } from "@nestjs/common";
import { ApodService } from "./apod.service";
import { ApodController } from "./apod.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { NasaProvider } from "src/shared/providers/nasa/implementation/nasa-provider";
import { PrismaApodRepository } from "./repositories/prisma/prisma-apod.repository";

@Module({
    imports: [PrismaModule],
    controllers: [ApodController],
    providers: [
        ApodService,
        {
            provide: "ApodRepository",
            useClass: PrismaApodRepository,
        },
        {
            provide: "NasaProvider",
            useClass: NasaProvider,
        },
    ],
})
export class ApodModule {}
