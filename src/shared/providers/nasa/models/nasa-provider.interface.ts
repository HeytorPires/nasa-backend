import ApodResponse from "./apod-response.interface";

export interface INasaProvider {
    getApod(queryParams: string): Promise<ApodResponse>;
    getApodBetweenDates(startDate: string, endDate: string): Promise<ApodResponse[]>;
    getRandomApod(quantity: number): Promise<ApodResponse[]>;
}
