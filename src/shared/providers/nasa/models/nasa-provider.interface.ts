import type { ApodResponse } from "./apod-response.interface";

export interface INasaProvider {
    getApod(date: string): Promise<ApodResponse | null>;
    getApodBetweenDates(startDate: string, endDate: string): Promise<ApodResponse[]>;
    getRandomApod(quantity: number): Promise<ApodResponse[]>;
}
