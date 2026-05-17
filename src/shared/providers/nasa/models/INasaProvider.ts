import { ApodResponse } from "src/modules/apod/interfaces/apod.response";

export interface INasaProvider {
    getApod(queryParams: string): Promise<ApodResponse>;
}
