import { Module } from "@nestjs/common";
import { EnvConfigModule } from "./env-config/env-config.module";
import { ApodModule } from "./modules/apod/apod.module";

@Module({
    imports: [EnvConfigModule, ApodModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
