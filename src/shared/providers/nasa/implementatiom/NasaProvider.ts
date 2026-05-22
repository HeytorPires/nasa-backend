import axios from "axios";
import { INasaProvider } from "../models/INasaProvider";
import ApodResponse from "../models/IApodResponse";

export default class NasaProvider implements INasaProvider {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = process.env.NASA_API_KEY || "";
        this.baseUrl = "https://api.nasa.gov";
    }

    async getApod(queryParams: string): Promise<ApodResponse> {
        const url = `${this.baseUrl}/planetary/apod?api_key=${this.apiKey}&${queryParams}`;
        const response = await axios
            .get(url)
            .then((res) => res)
            .catch((err) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                throw new Error(`Failed to fetch APOD data: ${err.message}`);
            });
        return response.data as ApodResponse;
    }
}
