import { Module } from "@nestjs/common";
import { ApodService } from "./apod.service";
import { ApodController } from "./apod.controller";
import { ApodRepository } from "./repositories/prisma/apod.repository";
import { PrismaModule } from "../prisma/prisma.module";
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
    ],
})
export class ApodModule {}
