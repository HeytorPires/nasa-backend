import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { InternalServerErrorException } from "@nestjs/common";
import axios from "axios";
import { NasaProvider } from "./nasa-provider";
import type ApodResponse from "../models/apod-response.interface";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("NasaProvider", () => {
    let provider: NasaProvider;

    const mockApodResponse: ApodResponse = {
        date: "2024-01-01",
        explanation: "Test explanation",
        media_type: "image",
        service_version: "v1",
        title: "Test Title",
        url: "https://example.com/image.jpg",
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NasaProvider,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue("test-api-key"),
                    },
                },
            ],
        }).compile();

        provider = module.get<NasaProvider>(NasaProvider);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(provider).toBeDefined();
    });

    describe("getApod", () => {
        it("should return APOD data for given query params", async () => {
            mockedAxios.get.mockResolvedValue({ data: mockApodResponse });

            const result = await provider.getApod("date=2024-01-01");

            expect(result).toEqual(mockApodResponse);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining("api_key=test-api-key&date=2024-01-01"),
            );
        });

        it("should throw InternalServerErrorException on failure", async () => {
            mockedAxios.get.mockRejectedValue({ message: "Network Error" });

            await expect(provider.getApod("date=2024-01-01")).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe("getApodBetweenDates", () => {
        it("should return APOD data for a date range", async () => {
            const mockResponse = [mockApodResponse];
            mockedAxios.get.mockResolvedValue({ data: mockResponse });

            const result = await provider.getApodBetweenDates("2024-01-01", "2024-01-05");

            expect(result).toEqual(mockResponse);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining("start_date=2024-01-01&end_date=2024-01-05"),
            );
        });

        it("should throw InternalServerErrorException on failure", async () => {
            mockedAxios.get.mockRejectedValue({ message: "Network Error" });

            await expect(provider.getApodBetweenDates("2024-01-01", "2024-01-05")).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe("getRandomApod", () => {
        it("should return random APOD data", async () => {
            const mockResponse = [mockApodResponse, mockApodResponse];
            mockedAxios.get.mockResolvedValue({ data: mockResponse });

            const result = await provider.getRandomApod(2);

            expect(result).toEqual(mockResponse);
            expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining("count=2"));
        });

        it("should reject when axios fails", async () => {
            mockedAxios.get.mockRejectedValue(new Error("Network Error"));

            await expect(provider.getRandomApod(2)).rejects.toThrow("Network Error");
        });
    });
});
