import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EnvConfigModule } from "./env-config/env-config.module";
import { ApodModule } from "./modules/apod/apod.module";
import { typeOrmConfig } from "./config/typeorm.config";

@Module({
    imports: [EnvConfigModule, ApodModule, TypeOrmModule.forRoot(typeOrmConfig)],
    controllers: [],
    providers: [],
})
export class AppModule {}
