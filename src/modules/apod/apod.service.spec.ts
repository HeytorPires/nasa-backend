import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { INasaProvider } from "src/shared/providers/nasa/models/nasa-provider.interface";
import { APOD_REPOSITORY, CACHE_PROVIDER, NASA_PROVIDER } from "src/shared/tokens";
import { ApodService } from "./apod.service";
import { ApodEntity } from "./entities/apod.entity";
import { IApodRepository } from "./repositories/apod-repository.interface";

import type { ApodResponse } from "src/shared/providers/nasa/models/apod-response.interface";

const apodFromApi: ApodResponse = {
    date: "2024-05-01",
    title: "Titulo",
    explanation: "Explicacao",
    media_type: "image",
    url: "https://example.com/image.jpg",
    hdurl: "https://example.com/image-hd.jpg",
};

const apodFromDb = {
    id: "uuid",
    date: "2024-05-01",
    title: "Titulo do banco",
    explanation: "Explicacao do banco",
    media_type: "image",
    service_version: null,
    url: "https://example.com/db.jpg",
    hdurl: null,
    permalink: null,
    copyright: null,
    alt: null,
    created_at: new Date(),
    updated_at: new Date(),
} as ApodEntity;

describe("ApodService", () => {
    let service: ApodService;
    let nasaProvider: jest.Mocked<INasaProvider>;
    let apodRepository: jest.Mocked<IApodRepository>;
    let cacheProvider: jest.Mocked<ICacheProvider>;

    beforeEach(async () => {
        nasaProvider = {
            getApod: jest.fn(),
            getApodBetweenDates: jest.fn(),
            getRandomApod: jest.fn(),
        };

        apodRepository = {
            findByDate: jest.fn(),
            findBetweenDates: jest.fn(),
            countBetweenDates: jest.fn(),
            upsertMany: jest.fn(),
        };

        cacheProvider = {
            save: jest.fn(),
            recover: jest.fn(),
            invalidate: jest.fn(),
            invalidatePrefix: jest.fn(),
            getOrSet: jest.fn(async (_key, _ttl, factory: () => Promise<unknown>) => factory()),
        } as unknown as jest.Mocked<ICacheProvider>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApodService,
                { provide: NASA_PROVIDER, useValue: nasaProvider },
                { provide: APOD_REPOSITORY, useValue: apodRepository },
                { provide: CACHE_PROVIDER, useValue: cacheProvider },
            ],
        }).compile();

        service = module.get<ApodService>(ApodService);
    });

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("findByDate", () => {
        it("devolve o valor do cache sem tocar em banco nem na NASA", async () => {
            cacheProvider.getOrSet.mockResolvedValueOnce(apodFromApi);

            await expect(service.findByDate("2024-05-01")).resolves.toEqual(apodFromApi);
            expect(apodRepository.findByDate).not.toHaveBeenCalled();
            expect(nasaProvider.getApod).not.toHaveBeenCalled();
        });

        it("devolve o registro do banco sem chamar a NASA", async () => {
            apodRepository.findByDate.mockResolvedValueOnce(apodFromDb);

            const result = await service.findByDate("2024-05-01");

            expect(result.title).toBe("Titulo do banco");
            expect(nasaProvider.getApod).not.toHaveBeenCalled();
        });

        it("busca na NASA e persiste quando não há cache nem banco", async () => {
            apodRepository.findByDate.mockResolvedValueOnce(null);
            nasaProvider.getApod.mockResolvedValueOnce(apodFromApi);

            await expect(service.findByDate("2024-05-01")).resolves.toEqual(apodFromApi);
            expect(apodRepository.upsertMany).toHaveBeenCalledWith([
                expect.objectContaining({ date: "2024-05-01", title: "Titulo" }),
            ]);
        });

        it("lança NotFoundException quando a data não tem APOD publicado", async () => {
            apodRepository.findByDate.mockResolvedValueOnce(null);
            nasaProvider.getApod.mockResolvedValueOnce(null);

            await expect(service.findByDate("1990-01-01")).rejects.toBeInstanceOf(NotFoundException);
            expect(apodRepository.upsertMany).not.toHaveBeenCalled();
        });
    });

    describe("findBetweenDates", () => {
        it("usa o banco quando há um registro para cada dia do intervalo", async () => {
            apodRepository.countBetweenDates.mockResolvedValueOnce(3);
            apodRepository.findBetweenDates.mockResolvedValueOnce([apodFromDb]);

            const result = await service.findBetweenDates("2024-05-01", "2024-05-03");

            expect(result).toHaveLength(1);
            expect(nasaProvider.getApodBetweenDates).not.toHaveBeenCalled();
        });

        it("busca na NASA quando o intervalo está incompleto no banco", async () => {
            apodRepository.countBetweenDates.mockResolvedValueOnce(1);
            nasaProvider.getApodBetweenDates.mockResolvedValueOnce([apodFromApi]);

            const result = await service.findBetweenDates("2024-05-01", "2024-05-03");

            expect(result).toEqual([apodFromApi]);
            expect(apodRepository.upsertMany).toHaveBeenCalledTimes(1);
        });

        it("não persiste nada quando a NASA devolve lista vazia", async () => {
            apodRepository.countBetweenDates.mockResolvedValueOnce(0);
            nasaProvider.getApodBetweenDates.mockResolvedValueOnce([]);

            await expect(service.findBetweenDates("2024-05-01", "2024-05-03")).resolves.toEqual([]);
            expect(apodRepository.upsertMany).not.toHaveBeenCalled();
        });
    });

    describe("findRandom", () => {
        it("persiste os APODs sorteados", async () => {
            nasaProvider.getRandomApod.mockResolvedValueOnce([apodFromApi, apodFromApi]);

            const result = await service.findRandom(2);

            expect(result).toHaveLength(2);
            expect(nasaProvider.getRandomApod).toHaveBeenCalledWith(2);
            expect(apodRepository.upsertMany).toHaveBeenCalledTimes(1);
        });
    });

    describe("syncToday", () => {
        it("não propaga erro quando o APOD do dia ainda não existe", async () => {
            apodRepository.findByDate.mockResolvedValueOnce(null);
            nasaProvider.getApod.mockResolvedValueOnce(null);

            await expect(service.syncToday()).resolves.toBeUndefined();
        });
    });
});
