import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosError } from "axios";

import type { INasaProvider } from "../models/nasa-provider.interface";
import type ApodResponse from "../models/apod-response.interface";

@Injectable()
export class NasaProvider implements INasaProvider {
    private readonly apiKey: string;
    private readonly baseUrl = "https://api.nasa.gov";

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>("NASA_API_KEY") || "";
    }

    async getApod(queryParams: string): Promise<ApodResponse> {
        try {
            const url = `${this.baseUrl}/planetary/apod` + `?api_key=${this.apiKey}&${queryParams}`;

            const response = await axios.get<ApodResponse>(url);

            return response.data;
        } catch (error) {
            const err = error as AxiosError;

            throw new InternalServerErrorException(`Failed to fetch APOD data: ${err.message}`);
        }
    }

    async getApodBetweenDates(startDate: string, endDate: string): Promise<ApodResponse[]> {
        try {
            const url =
                `${this.baseUrl}/planetary/apod` +
                `?api_key=${this.apiKey}&start_date=${startDate}&end_date=${endDate}`;

            const response = await axios.get<ApodResponse[]>(url);

            return response.data;
        } catch (error) {
            const err = error as AxiosError;

            throw new InternalServerErrorException(`Failed to fetch APOD data: ${err.message}`);
        }
    }

    getRandomApod(quantity: number): Promise<ApodResponse[]> {
        try {
            const url = `${this.baseUrl}/planetary/apod` + `?api_key=${this.apiKey}&count=${quantity}`;

            return axios.get<ApodResponse[]>(url).then((response) => response.data);
        } catch (error) {
            const err = error as AxiosError;

            throw new InternalServerErrorException(`Failed to fetch APOD data: ${err.message}`);
        }
    }
}
