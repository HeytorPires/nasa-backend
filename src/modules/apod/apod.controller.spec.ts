import { Test, TestingModule } from "@nestjs/testing";
import { ApodController } from "./apod.controller";
import { ApodService } from "./apod.service";

describe("ApodController", () => {
    let controller: ApodController;
    let service: ApodService;

    const mockApodService = {
        findByDate: jest.fn(),
        findBetweenDates: jest.fn(),
        findRandom: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ApodController],
            providers: [{ provide: ApodService, useValue: mockApodService }],
        }).compile();

        controller = module.get<ApodController>(ApodController);
        service = module.get<ApodService>(ApodService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("findByDate", () => {
        it("should call apodService.findByDate with a Date object", async () => {
            const mockResult = { title: "Test" };
            mockApodService.findByDate.mockResolvedValue(mockResult);

            const result = await controller.findByDate("2024-01-15");

            expect(result).toEqual(mockResult);
            expect(service.findByDate).toHaveBeenCalledWith(new Date("2024-01-15"));
        });
    });

    describe("findBetweenDates", () => {
        it("should call apodService.findBetweenDates with Date objects", async () => {
            const mockResult = [{ title: "Test 1" }, { title: "Test 2" }];
            mockApodService.findBetweenDates.mockResolvedValue(mockResult);

            const result = await controller.findBetweenDates("2024-01-01", "2024-01-05");

            expect(result).toEqual(mockResult);
            expect(service.findBetweenDates).toHaveBeenCalledWith(new Date("2024-01-01"), new Date("2024-01-05"));
        });
    });

    describe("findRandom", () => {
        it("should call apodService.findRandom with the quantity", async () => {
            const mockResult = [{ title: "Random 1" }];
            mockApodService.findRandom.mockResolvedValue(mockResult);

            const result = await controller.findRandom(5);

            expect(result).toEqual(mockResult);
            expect(service.findRandom).toHaveBeenCalledWith(5);
        });
    });
});
