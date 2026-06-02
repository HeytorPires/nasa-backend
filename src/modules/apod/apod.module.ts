import { Module } from "@nestjs/common";
import { ApodService } from "./apod.service";
import { ApodController } from "./apod.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { NasaModule } from "src/shared/providers/nasa/nasa.module";
import { PrismaApodRepository } from "./repositories/prisma/prisma-apod.repository";
import { CacheModule } from "src/shared/providers/cache/cache.module";

@Module({
    imports: [PrismaModule, CacheModule, NasaModule],
    controllers: [ApodController],
    providers: [
        ApodService,
        {
            provide: "ApodRepository",
            useClass: PrismaApodRepository,
        },
    ],
})
export class ApodModule {}
