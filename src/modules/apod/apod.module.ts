import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "src/shared/providers/cache/cache.module";
import { NasaModule } from "src/shared/providers/nasa/nasa.module";
import { APOD_REPOSITORY } from "src/shared/tokens";
import { ApodController } from "./apod.controller";
import { ApodService } from "./apod.service";
import { ApodEntity } from "./entities/apod.entity";
import { TypeOrmApodRepository } from "./repositories/typeorm/typeorm-apod.repository";

@Module({
    imports: [TypeOrmModule.forFeature([ApodEntity]), CacheModule, NasaModule],
    controllers: [ApodController],
    providers: [
        ApodService,
        {
            provide: APOD_REPOSITORY,
            useClass: TypeOrmApodRepository,
        },
    ],
})
export class ApodModule {}
