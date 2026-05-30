import { Test, TestingModule } from "@nestjs/testing";
import { ApodService } from "./apod.service";
import { IApodRepository } from "./repositories/apod-repository.interface";
import { INasaProvider } from "src/shared/providers/nasa/models/nasa-provider.interface";
import { ApodEntity } from "./entities/apod.entity";
import type ApodResponse from "src/shared/providers/nasa/models/apod-response.interface";

describe("ApodService", () => {
    let service: ApodService;
    let nasaProvider: INasaProvider;
    let apodRepository: IApodRepository;

    const mockApodResponse: ApodResponse = {
        date: "2024-01-15",
        explanation: "Test explanation",
        media_type: "image",
        service_version: "v1",
        title: "Test Title",
        url: "https://example.com/image.jpg",
    };

    const mockApodEntity: ApodEntity = {
        id: "uuid-123",
        date: new Date("2024-01-15"),
        explanation: "Test explanation",
        media_type: "image",
        service_version: "v1",
        title: "Test Title",
        url: "https://example.com/image.jpg",
        created_at: new Date(),
    };

    const mockNasaProvider: INasaProvider = {
        getApod: jest.fn(),
        getApodBetweenDates: jest.fn(),
        getRandomApod: jest.fn(),
    };

    const mockApodRepository: IApodRepository = {
        findByDate: jest.fn(),
        create: jest.fn(),
        countBetweenDates: jest.fn(),
        findBetweenDates: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApodService,
                { provide: "NasaProvider", useValue: mockNasaProvider },
                { provide: "ApodRepository", useValue: mockApodRepository },
            ],
        }).compile();

        service = module.get<ApodService>(ApodService);
        nasaProvider = module.get<INasaProvider>("NasaProvider");
        apodRepository = module.get<IApodRepository>("ApodRepository");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("findByDate", () => {
        it("deve retornar um apod do repositório se ele existir.", async () => {
            (apodRepository.findByDate as jest.Mock).mockResolvedValue(mockApodEntity);

            const result = await service.findByDate(new Date("2024-01-15"));

            expect(result).toEqual(mockApodEntity);
            expect(apodRepository.findByDate).toHaveBeenCalledWith(new Date("2024-01-15"));
            expect(nasaProvider.getApod).not.toHaveBeenCalled();
        });

        it("Deve buscar os dados na API da NASA, caso não estejam no repositório, e salvá-los.", async () => {
            (apodRepository.findByDate as jest.Mock).mockResolvedValue(null);
            (nasaProvider.getApod as jest.Mock).mockResolvedValue(mockApodResponse);

            const result = await service.findByDate(new Date("2024-01-15"));

            expect(result).toEqual(mockApodResponse);
            expect(nasaProvider.getApod).toHaveBeenCalledWith("date=2024-01-15");
            expect(apodRepository.create).toHaveBeenCalled();
        });

        it("Deve retornar null se não estiver no repositório e não estiver na API", async () => {
            (apodRepository.findByDate as jest.Mock).mockResolvedValue(null);
            (nasaProvider.getApod as jest.Mock).mockResolvedValue(null);

            const result = await service.findByDate(new Date("2024-01-15"));

            expect(result).toBeNull();
        });

        it("Não deve criar duplicatas se o apod já existir durante resolveCreateOrUpdate", async () => {
            (apodRepository.findByDate as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce(mockApodEntity);
            (nasaProvider.getApod as jest.Mock).mockResolvedValue(mockApodResponse);

            await service.findByDate(new Date("2024-01-15"));

            expect(apodRepository.create).not.toHaveBeenCalled();
        });
    });

    describe("findBetweenDates", () => {
        it("Deve retornar apods do repositório quando todos os dias estão em cache", async () => {
            const startDate = new Date("2024-01-01");
            const endDate = new Date("2024-01-03");
            const mockApods = [mockApodEntity, mockApodEntity, mockApodEntity];

            (apodRepository.countBetweenDates as jest.Mock).mockResolvedValue(3);
            (apodRepository.findBetweenDates as jest.Mock).mockResolvedValue(mockApods);

            const result = await service.findBetweenDates(startDate, endDate);

            expect(result).toEqual(mockApods);
            expect(apodRepository.findBetweenDates).toHaveBeenCalledWith(startDate, endDate);
            expect(nasaProvider.getApodBetweenDates).not.toHaveBeenCalled();
        });

        it("Deve buscar os dados na API da NASA quando nem todos os dias estão em cache", async () => {
            const startDate = new Date("2024-01-01");
            const endDate = new Date("2024-01-03");
            const mockApiResponse = [mockApodResponse, mockApodResponse, mockApodResponse];

            (apodRepository.countBetweenDates as jest.Mock).mockResolvedValue(1);
            (nasaProvider.getApodBetweenDates as jest.Mock).mockResolvedValue(mockApiResponse);
            (apodRepository.findByDate as jest.Mock).mockResolvedValue(null);
            (apodRepository.create as jest.Mock).mockResolvedValue(mockApodEntity);

            const result = await service.findBetweenDates(startDate, endDate);

            expect(result).toEqual(mockApiResponse);
            expect(nasaProvider.getApodBetweenDates).toHaveBeenCalledWith("2024-01-01", "2024-01-03");
        });

        it("Deve lançar um erro quando o intervalo de datas exceder 30 dias", async () => {
            const startDate = new Date("2024-01-01");
            const endDate = new Date("2024-02-15");

            await expect(service.findBetweenDates(startDate, endDate)).rejects.toThrow(
                "The maximum date range is 30 days.",
            );
        });
    });

    describe("findRandom", () => {
        it("Deve retornar apods aleatórios da API da NASA", async () => {
            const mockApiResponse = [mockApodResponse, mockApodResponse];
            (nasaProvider.getRandomApod as jest.Mock).mockResolvedValue(mockApiResponse);
            (apodRepository.findByDate as jest.Mock).mockResolvedValue(null);
            (apodRepository.create as jest.Mock).mockResolvedValue(mockApodEntity);

            const result = await service.findRandom(2);

            expect(result).toEqual(mockApiResponse);
            expect(nasaProvider.getRandomApod).toHaveBeenCalledWith(2);
        });

        it("Deve lançar um erro quando a quantidade exceder 100", async () => {
            await expect(service.findRandom(101)).rejects.toThrow("The maximum quantity is 100.");
        });

        it("Deve salvar os apods aleatórios buscados no repositório", async () => {
            const mockApiResponse = [mockApodResponse];
            (nasaProvider.getRandomApod as jest.Mock).mockResolvedValue(mockApiResponse);
            (apodRepository.findByDate as jest.Mock).mockResolvedValue(null);
            (apodRepository.create as jest.Mock).mockResolvedValue(mockApodEntity);

            await service.findRandom(1);

            expect(apodRepository.create).toHaveBeenCalled();
        });
    });
});
