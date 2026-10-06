import type { MarsWeatherResponse } from "./mars-weather-response.interface";

export interface IMarsWeatherProvider {
    getLatest(): Promise<MarsWeatherResponse>;
}
