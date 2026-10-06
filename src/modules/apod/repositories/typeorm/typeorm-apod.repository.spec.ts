import { getRepositoryToken } from "@nestjs/typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { Between, Repository } from "typeorm";
import { ApodEntity } from "../../entities/apod.entity";
import { TypeOrmApodRepository } from "./typeorm-apod.repository";

describe("TypeOrmApodRepository", () => {
    let apodRepository: TypeOrmApodRepository;
    let typeOrmRepository: jest.Mocked<Repository<ApodEntity>>;

    const apod = { id: "uuid", date: "2024-05-01" } as ApodEntity;

    beforeEach(async () => {
        typeOrmRepository = {
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            upsert: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        } as unknown as jest.Mocked<Repository<ApodEntity>>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TypeOrmApodRepository,
                { provide: getRepositoryToken(ApodEntity), useValue: typeOrmRepository },
            ],
        }).compile();

        apodRepository = module.get<TypeOrmApodRepository>(TypeOrmApodRepository);
    });

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(apodRepository).toBeDefined();
    });

    it("findByDate filtra pela data", async () => {
        typeOrmRepository.findOne.mockResolvedValueOnce(apod);

        await expect(apodRepository.findByDate("2024-05-01")).resolves.toEqual(apod);
        expect(typeOrmRepository.findOne).toHaveBeenCalledWith({ where: { date: "2024-05-01" } });
    });

    it("findBetweenDates usa Between e ordena por data", async () => {
        typeOrmRepository.find.mockResolvedValueOnce([apod]);

        await apodRepository.findBetweenDates("2024-05-01", "2024-05-03");

        expect(typeOrmRepository.find).toHaveBeenCalledWith({
            where: { date: Between("2024-05-01", "2024-05-03") },
            order: { date: "ASC" },
        });
    });

    it("countBetweenDates conta o intervalo", async () => {
        typeOrmRepository.count.mockResolvedValueOnce(3);

        await expect(apodRepository.countBetweenDates("2024-05-01", "2024-05-03")).resolves.toBe(3);
    });

    it("upsertMany resolve o conflito pela coluna date", async () => {
        await apodRepository.upsertMany([{ date: "2024-05-01" }]);

        expect(typeOrmRepository.upsert).toHaveBeenCalledWith(
            [{ date: "2024-05-01" }],
            expect.objectContaining({ conflictPaths: ["date"] }),
        );
    });

    it("upsertMany não chama o banco com lista vazia", async () => {
        await apodRepository.upsertMany([]);

        expect(typeOrmRepository.upsert).not.toHaveBeenCalled();
    });
});
