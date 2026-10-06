import { Test, TestingModule } from "@nestjs/testing";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { IExoplanetProvider } from "src/shared/providers/exoplanet/models/exoplanet-provider.interface";
import { createCacheProviderMock } from "src/shared/testing/cache-provider.mock";
import { CACHE_PROVIDER, EXOPLANET_PROVIDER, EXOPLANET_REPOSITORY } from "src/shared/tokens";
import { ExoplanetsService } from "./exoplanets.service";
import { IExoplanetRepository } from "./repositories/exoplanet-repository.interface";

describe("ExoplanetsService", () => {
    let service: ExoplanetsService;
    let exoplanetProvider: jest.Mocked<IExoplanetProvider>;
    let exoplanetRepository: jest.Mocked<IExoplanetRepository>;
    let cacheProvider: jest.Mocked<ICacheProvider>;

    beforeEach(async () => {
        exoplanetProvider = { query: jest.fn() };
        exoplanetRepository = { findByName: jest.fn(), upsertMany: jest.fn() };
        cacheProvider = createCacheProviderMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExoplanetsService,
                { provide: EXOPLANET_PROVIDER, useValue: exoplanetProvider },
                { provide: EXOPLANET_REPOSITORY, useValue: exoplanetRepository },
                { provide: CACHE_PROVIDER, useValue: cacheProvider },
            ],
        }).compile();

        service = module.get<ExoplanetsService>(ExoplanetsService);
    });

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("traduz os filtros nomeados em condições sobre colunas da allowlist", async () => {
        exoplanetProvider.query.mockResolvedValueOnce([]);

        await service.find({ hostname: "HD 2039", minRadiusEarth: 1, maxDistanceParsec: 100, limit: 10 });

        expect(exoplanetProvider.query).toHaveBeenCalledWith({
            filters: [
                { column: "hostname", operator: "eq", value: "HD 2039" },
                { column: "pl_rade", operator: "gte", value: 1 },
                { column: "sy_dist", operator: "lte", value: 100 },
            ],
            limit: 10,
            orderBy: undefined,
            orderDirection: undefined,
        });
    });

    it("persiste apenas linhas com pl_name", async () => {
        exoplanetProvider.query.mockResolvedValueOnce([
            { pl_name: "HD 2039 b", hostname: "HD 2039", disc_year: 2002 },
            { pl_name: "" },
        ]);

        await service.find({});

        expect(exoplanetRepository.upsertMany).toHaveBeenCalledWith([
            expect.objectContaining({ pl_name: "HD 2039 b", disc_year: 2002 }),
        ]);
    });

    it("syncRecentDiscoveries não propaga falha do upstream", async () => {
        exoplanetProvider.query.mockRejectedValueOnce(new Error("TAP indisponível"));

        await expect(service.syncRecentDiscoveries()).resolves.toBeUndefined();
    });
});
