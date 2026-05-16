import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EnvConfigService } from "./env-config.service";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ".env",
        }),
    ],
    providers: [EnvConfigService],
    exports: [EnvConfigService],
})
export class EnvConfigModule extends ConfigModule {}
