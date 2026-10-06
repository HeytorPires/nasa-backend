import { Module } from "@nestjs/common";
import { EXOPLANET_PROVIDER } from "src/shared/tokens";
import { ExoplanetProvider } from "./implementation/exoplanet-provider";

@Module({
    providers: [
        {
            provide: EXOPLANET_PROVIDER,
            useClass: ExoplanetProvider,
        },
    ],
    exports: [EXOPLANET_PROVIDER],
})
export class ExoplanetModule {}
