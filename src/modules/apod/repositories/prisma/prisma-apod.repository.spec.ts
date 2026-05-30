import { Test, TestingModule } from "@nestjs/testing";
import { PrismaApodRepository } from "./prisma-apod.repository";
import { PrismaService } from "src/modules/prisma/prisma.service";

jest.mock("@prisma/adapter-pg", () => ({
    PrismaPg: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("src/generated/prisma/client", () => {
    return { PrismaClient: jest.fn() };
});

describe("PrismaApodRepository", () => {
    let repository: PrismaApodRepository;

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

    const mockPrismaService = {
        apod: {
            create: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PrismaApodRepository, { provide: PrismaService, useValue: mockPrismaService }],
        }).compile();

        repository = module.get<PrismaApodRepository>(PrismaApodRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(repository).toBeDefined();
    });

    describe("create", () => {
        it("should create a new apod record", async () => {
            mockPrismaService.apod.create.mockResolvedValue(mockApod);

            const result = await repository.create(mockApod);

            expect(result).toEqual(mockApod);
            expect(mockPrismaService.apod.create).toHaveBeenCalledWith({
                data: {
                    date: mockApod.date,
                    title: mockApod.title,
                    explanation: mockApod.explanation,
                    url: mockApod.url,
                    media_type: mockApod.media_type,
                    service_version: mockApod.service_version,
                    created_at: mockApod.created_at,
                },
            });
        });
    });

    describe("findByDate", () => {
        it("should return an apod for a given date", async () => {
            mockPrismaService.apod.findFirst.mockResolvedValue(mockApod);

            const result = await repository.findByDate(new Date("2024-01-15"));

            expect(result).toEqual(mockApod);
            expect(mockPrismaService.apod.findFirst).toHaveBeenCalledWith({
                where: { date: new Date("2024-01-15") },
            });
        });

        it("should return null if no apod found", async () => {
            mockPrismaService.apod.findFirst.mockResolvedValue(null);

            const result = await repository.findByDate(new Date("2024-01-15"));

            expect(result).toBeNull();
        });
    });

    describe("findBetweenDates", () => {
        it("should return apods between two dates ordered by date asc", async () => {
            const mockApods = [mockApod, { ...mockApod, id: "uuid-456" }];
            mockPrismaService.apod.findMany.mockResolvedValue(mockApods);

            const startDate = new Date("2024-01-01");
            const endDate = new Date("2024-01-15");

            const result = await repository.findBetweenDates(startDate, endDate);

            expect(result).toEqual(mockApods);
            expect(mockPrismaService.apod.findMany).toHaveBeenCalledWith({
                where: {
                    date: { gte: startDate, lte: endDate },
                },
                orderBy: { date: "asc" },
            });
        });
    });

    describe("countBetweenDates", () => {
        it("should return the count of apods between two dates", async () => {
            mockPrismaService.apod.count.mockResolvedValue(5);

            const startDate = new Date("2024-01-01");
            const endDate = new Date("2024-01-05");

            const result = await repository.countBetweenDates(startDate, endDate);

            expect(result).toBe(5);
            expect(mockPrismaService.apod.count).toHaveBeenCalledWith({
                where: {
                    date: { gte: startDate, lte: endDate },
                },
            });
        });
    });
});
