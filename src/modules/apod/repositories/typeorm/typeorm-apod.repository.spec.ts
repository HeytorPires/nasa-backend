import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Between } from "typeorm";
import { TypeOrmApodRepository } from "./typeorm-apod.repository";
import { ApodEntity } from "../../entities/apod.entity";

describe("TypeOrmApodRepository", () => {
    let repository: TypeOrmApodRepository;

    const mockApod = {
        id: "uuid-123",
        date: new Date("2024-01-15"),
        title: "Test Title",
        explanation: "Test explanation",
        url: "https://example.com/image.jpg",
        media_type: "image",
        service_version: "v1",
        created_at: new Date(),
    };

    const mockApodEntityRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        count: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TypeOrmApodRepository,
                { provide: getRepositoryToken(ApodEntity), useValue: mockApodEntityRepository },
            ],
        }).compile();

        repository = module.get<TypeOrmApodRepository>(TypeOrmApodRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(repository).toBeDefined();
    });

    describe("create", () => {
        it("Deve criar um novo registro de apod", async () => {
            mockApodEntityRepository.create.mockReturnValue(mockApod);
            mockApodEntityRepository.save.mockResolvedValue(mockApod);

            const result = await repository.create(mockApod);

            expect(result).toEqual(mockApod);
            expect(mockApodEntityRepository.create).toHaveBeenCalledWith(mockApod);
            expect(mockApodEntityRepository.save).toHaveBeenCalledWith(mockApod);
        });
    });

    describe("findByDate", () => {
        it("Deve retornar um apod para uma data específica", async () => {
            mockApodEntityRepository.findOne.mockResolvedValue(mockApod);

            const result = await repository.findByDate(new Date("2024-01-15"));

            expect(result).toEqual(mockApod);
            expect(mockApodEntityRepository.findOne).toHaveBeenCalledWith({
                where: { date: new Date("2024-01-15") },
            });
        });

        it("Deve retornar null se nenhum apod for encontrado", async () => {
            mockApodEntityRepository.findOne.mockResolvedValue(null);

            const result = await repository.findByDate(new Date("2024-01-15"));

            expect(result).toBeNull();
        });
    });

    describe("findBetweenDates", () => {
        it("Deve retornar apods entre duas datas ordenados por data asc", async () => {
            const mockApods = [mockApod, { ...mockApod, id: "uuid-456" }];
            mockApodEntityRepository.find.mockResolvedValue(mockApods);

            const startDate = new Date("2024-01-01");
            const endDate = new Date("2024-01-15");

            const result = await repository.findBetweenDates(startDate, endDate);

            expect(result).toEqual(mockApods);
            expect(mockApodEntityRepository.find).toHaveBeenCalledWith({
                where: {
                    date: Between(startDate, endDate),
                },
                order: { date: "ASC" },
            });
        });
    });

    describe("countBetweenDates", () => {
        it("Deve retornar a contagem de apods entre duas datas", async () => {
            mockApodEntityRepository.count.mockResolvedValue(5);

            const startDate = new Date("2024-01-01");
            const endDate = new Date("2024-01-05");

            const result = await repository.countBetweenDates(startDate, endDate);

            expect(result).toBe(5);
            expect(mockApodEntityRepository.count).toHaveBeenCalledWith({
                where: {
                    date: Between(startDate, endDate),
                },
            });
        });
    });
});
