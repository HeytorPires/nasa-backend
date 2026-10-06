import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "./config/typeorm.config";
import { EnvConfigModule } from "./env-config/env-config.module";
import { ApodModule } from "./modules/apod/apod.module";
import { DonkiModule } from "./modules/donki/donki.module";
import { EonetModule } from "./modules/eonet/eonet.module";
import { EpicModule } from "./modules/epic/epic.module";
import { ExoplanetsModule } from "./modules/exoplanets/exoplanets.module";
import { MarsWeatherModule } from "./modules/mars-weather/mars-weather.module";
import { MediaModule } from "./modules/media/media.module";
import { NeoModule } from "./modules/neo/neo.module";
import { SsdModule } from "./modules/ssd/ssd.module";
import { TechTransferModule } from "./modules/tech-transfer/tech-transfer.module";
import { TechportModule } from "./modules/techport/techport.module";
import { TleModule } from "./modules/tle/tle.module";
import { HttpClientModule } from "./shared/providers/http/http.module";
import { SchedulerModule } from "./shared/providers/scheduler/scheduler.module";

@Module({
    imports: [
        EnvConfigModule,
        HttpClientModule,
        SchedulerModule,
        ApodModule,
        NeoModule,
        DonkiModule,
        EpicModule,
        EonetModule,
        MarsWeatherModule,
        MediaModule,
        TechTransferModule,
        TleModule,
        SsdModule,
        TechportModule,
        ExoplanetsModule,
        TypeOrmModule.forRoot(typeOrmConfig),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
