import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApodService } from "./apod.service";
import { ApodController } from "./apod.controller";
import { NasaModule } from "src/shared/providers/nasa/nasa.module";
import { TypeOrmApodRepository } from "./repositories/typeorm/typeorm-apod.repository";
import { CacheModule } from "src/shared/providers/cache/cache.module";
import { ApodEntity } from "./entities/apod.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ApodEntity]), CacheModule, NasaModule],
    controllers: [ApodController],
    providers: [
        ApodService,
        {
            provide: "ApodRepository",
            useClass: TypeOrmApodRepository,
        },
    ],
})
export class ApodModule {}
