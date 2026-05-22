import ApodResponse from "./IApodResponse";

export interface INasaProvider {
    getApod(queryParams: string): Promise<ApodResponse>;
}
