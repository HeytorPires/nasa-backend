import { Module } from "@nestjs/common";
import { MARS_WEATHER_PROVIDER } from "src/shared/tokens";
import { MarsWeatherProvider } from "./implementation/mars-weather-provider";

@Module({
    providers: [
        {
            provide: MARS_WEATHER_PROVIDER,
            useClass: MarsWeatherProvider,
        },
    ],
    exports: [MARS_WEATHER_PROVIDER],
})
export class MarsWeatherModule {}
