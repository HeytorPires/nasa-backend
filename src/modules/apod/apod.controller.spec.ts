import { Test, TestingModule } from "@nestjs/testing";
import { ApodController } from "./apod.controller";
import { ApodService } from "./apod.service";

import type { ApodResponse } from "src/shared/providers/nasa/models/apod-response.interface";

const apod: ApodResponse = {
    date: "2024-05-01",
    title: "Titulo",
    explanation: "Explicacao",
    media_type: "image",
    url: "https://example.com/image.jpg",
};

describe("ApodController", () => {
    let controller: ApodController;
    let apodService: jest.Mocked<Pick<ApodService, "findByDate" | "findBetweenDates" | "findRandom">>;

    beforeEach(async () => {
        apodService = {
            findByDate: jest.fn(),
            findBetweenDates: jest.fn(),
            findRandom: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ApodController],
            providers: [{ provide: ApodService, useValue: apodService }],
        }).compile();

        controller = module.get<ApodController>(ApodController);
    });

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    it("findByDate repassa a data do parâmetro", async () => {
        apodService.findByDate.mockResolvedValueOnce(apod);

        await expect(controller.findByDate({ date: "2024-05-01" })).resolves.toEqual(apod);
        expect(apodService.findByDate).toHaveBeenCalledWith("2024-05-01");
    });

    it("findBetweenDates repassa o intervalo da query", async () => {
        apodService.findBetweenDates.mockResolvedValueOnce([apod]);

        await expect(controller.findBetweenDates({ startDate: "2024-05-01", endDate: "2024-05-03" })).resolves.toEqual([
            apod,
        ]);
        expect(apodService.findBetweenDates).toHaveBeenCalledWith("2024-05-01", "2024-05-03");
    });

    it("findRandom usa 1 como quantidade padrão", async () => {
        apodService.findRandom.mockResolvedValueOnce([apod]);

        await controller.findRandom({});

        expect(apodService.findRandom).toHaveBeenCalledWith(1);
    });
});
