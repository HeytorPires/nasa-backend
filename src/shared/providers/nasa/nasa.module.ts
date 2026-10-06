import { Module } from "@nestjs/common";
import { NASA_PROVIDER } from "src/shared/tokens";
import { ApodWordPressProvider } from "./implementation/apod-wordpress.provider";

@Module({
    providers: [
        {
            provide: NASA_PROVIDER,
            useClass: ApodWordPressProvider,
        },
    ],
    exports: [NASA_PROVIDER],
})
export class NasaModule {}
