import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "src/shared/providers/cache/cache.module";
import { MarsWeatherModule as MarsWeatherProviderModule } from "src/shared/providers/mars-weather/mars-weather.module";
import { MARS_WEATHER_REPOSITORY } from "src/shared/tokens";
import { MarsWeatherSolEntity } from "./entities/mars-weather-sol.entity";
import { MarsWeatherController } from "./mars-weather.controller";
import { MarsWeatherService } from "./mars-weather.service";
import { TypeOrmMarsWeatherRepository } from "./repositories/typeorm/typeorm-mars-weather.repository";

@Module({
    imports: [TypeOrmModule.forFeature([MarsWeatherSolEntity]), CacheModule, MarsWeatherProviderModule],
    controllers: [MarsWeatherController],
    providers: [
        MarsWeatherService,
        {
            provide: MARS_WEATHER_REPOSITORY,
            useClass: TypeOrmMarsWeatherRepository,
        },
    ],
})
export class MarsWeatherModule {}
