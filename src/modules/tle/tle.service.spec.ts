import { Test, TestingModule } from "@nestjs/testing";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { ITleProvider } from "src/shared/providers/tle/models/tle-provider.interface";
import { createCacheProviderMock } from "src/shared/testing/cache-provider.mock";
import { CACHE_PROVIDER, TLE_PROVIDER, TLE_REPOSITORY } from "src/shared/tokens";
import { ITleRepository } from "./repositories/tle-repository.interface";
import { TleService } from "./tle.service";

const record = {
    satelliteId: 25544,
    name: "ISS (ZARYA)",
    date: "2026-09-10T17:22:43+00:00",
    line1: "1 25544U ...",
    line2: "2 25544 ...",
};

describe("TleService", () => {
    let service: TleService;
    let tleProvider: jest.Mocked<ITleProvider>;
    let tleRepository: jest.Mocked<ITleRepository>;
    let cacheProvider: jest.Mocked<ICacheProvider>;

    beforeEach(async () => {
        tleProvider = { search: jest.fn(), getBySatelliteId: jest.fn() };
        tleRepository = {
            findLatestBySatelliteId: jest.fn(),
            findTrackedSatelliteIds: jest.fn(),
            upsertMany: jest.fn(),
        };
        cacheProvider = createCacheProviderMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TleService,
                { provide: TLE_PROVIDER, useValue: tleProvider },
                { provide: TLE_REPOSITORY, useValue: tleRepository },
                { provide: CACHE_PROVIDER, useValue: cacheProvider },
            ],
        }).compile();

        service = module.get<TleService>(TleService);
    });

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("persiste cada TLE da busca com a época convertida", async () => {
        tleProvider.search.mockResolvedValueOnce({ totalItems: 1, member: [record] });

        await service.search("iss", 1, 20);

        expect(tleRepository.upsertMany).toHaveBeenCalledWith([
            expect.objectContaining({ satellite_id: 25544, epoch: new Date("2026-09-10T17:22:43+00:00") }),
        ]);
    });

    it("não falha quando a busca não devolve membros", async () => {
        tleProvider.search.mockResolvedValueOnce({ totalItems: 0, member: [] });

        await expect(service.search("nada", 1, 20)).resolves.toBeDefined();
        expect(tleRepository.upsertMany).not.toHaveBeenCalled();
    });

    it("syncTrackedSatellites não chama o upstream sem satélites registrados", async () => {
        tleRepository.findTrackedSatelliteIds.mockResolvedValueOnce([]);

        await service.syncTrackedSatellites();

        expect(tleProvider.getBySatelliteId).not.toHaveBeenCalled();
    });

    it("syncTrackedSatellites continua após falha em um satélite", async () => {
        tleRepository.findTrackedSatelliteIds.mockResolvedValueOnce([1, 2]);
        tleProvider.getBySatelliteId.mockRejectedValueOnce(new Error("falhou")).mockResolvedValueOnce(record);

        await expect(service.syncTrackedSatellites()).resolves.toBeUndefined();
        expect(tleRepository.upsertMany).toHaveBeenCalledTimes(1);
    });
});
