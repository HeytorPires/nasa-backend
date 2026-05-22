import { Module } from "@nestjs/common";
import { ApodService } from "./apod.service";
import { ApodController } from "./apod.controller";
import { ApodRepository } from "./repositories/prisma/apod.repository";
import { PrismaModule } from "../prisma/prisma.module";
import { NasaProvider } from "src/shared/providers/nasa/implementation/nasa-provider";
// import { IApodRepository } from "./repositories/apod-repository.interface";

@Module({
    imports: [PrismaModule],
    controllers: [ApodController],
    providers: [
        ApodService,
        {
            provide: "IApodRepository",
            useClass: ApodRepository,
        },
        {
            provide: "INasaProvider",
            useClass: NasaProvider,
        },
    ],
})
export class ApodModule {}
