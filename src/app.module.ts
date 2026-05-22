import { Module } from "@nestjs/common";
import { EnvConfigModule } from "./env-config/env-config.module";
import { ApodModule } from "./modules/apod/apod.module";
import { PrismaModule } from "./modules/prisma/prisma.module";

@Module({
    imports: [EnvConfigModule, ApodModule, PrismaModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
