import { Test, TestingModule } from "@nestjs/testing";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { ISsdProvider } from "src/shared/providers/ssd/models/ssd-provider.interface";
import { createCacheProviderMock } from "src/shared/testing/cache-provider.mock";
import { CACHE_PROVIDER, SSD_PROVIDER, SSD_REPOSITORY } from "src/shared/tokens";
import { ISsdRepository } from "./repositories/ssd-repository.interface";
import { SsdService } from "./ssd.service";

describe("SsdService", () => {
    let service: SsdService;
    let ssdProvider: jest.Mocked<ISsdProvider>;
    let ssdRepository: jest.Mocked<ISsdRepository>;
    let cacheProvider: jest.Mocked<ICacheProvider>;

    beforeEach(async () => {
        ssdProvider = {
            getCloseApproaches: jest.fn(),
            getFireballs: jest.fn(),
            getSentry: jest.fn(),
            getNhats: jest.fn(),
            getScout: jest.fn(),
            getMissionDesign: jest.fn(),
        };
        ssdRepository = {
            upsertCloseApproaches: jest.fn(),
            upsertFireballs: jest.fn(),
            upsertSentryObjects: jest.fn(),
        };
        cacheProvider = createCacheProviderMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SsdService,
                { provide: SSD_PROVIDER, useValue: ssdProvider },
                { provide: SSD_REPOSITORY, useValue: ssdRepository },
                { provide: CACHE_PROVIDER, useValue: cacheProvider },
            ],
        }).compile();

        service = module.get<SsdService>(SsdService);
    });

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("converte a tabela fields/data em linhas nomeadas", async () => {
        ssdProvider.getCloseApproaches.mockResolvedValueOnce({
            count: 1,
            fields: ["des", "cd", "dist", "v_rel"],
            data: [["2024 AV2", "2024-Jan-01 02:47", "0.0097", "8.06"]],
        });

        await service.findCloseApproaches({});

        expect(ssdRepository.upsertCloseApproaches).toHaveBeenCalledWith([
            expect.objectContaining({
                designation: "2024 AV2",
                distance_au: 0.0097,
                relative_velocity_kms: 8.06,
                close_approach_at: new Date("2024-01-01T02:47:00Z"),
            }),
        ]);
    });

    it("aplica o sinal do hemisfério às coordenadas do fireball", async () => {
        ssdProvider.getFireballs.mockResolvedValueOnce({
            count: 1,
            fields: ["date", "lat", "lat-dir", "lon", "lon-dir", "impact-e"],
            data: [["2026-09-10 05:22:22", "19.3", "S", "28.1", "W", "0.33"]],
        });

        await service.findFireballs({});

        expect(ssdRepository.upsertFireballs).toHaveBeenCalledWith([
            expect.objectContaining({ latitude: -19.3, longitude: -28.1, impact_energy: 0.33 }),
        ]);
    });

    it("persiste os objetos do Sentry, que já vêm nomeados", async () => {
        ssdProvider.getSentry.mockResolvedValueOnce({
            count: 1,
            data: [{ des: "1979 XB", fullname: "(1979 XB)", ip: "8.5e-07", ps_cum: "-2.69" }],
        });

        await service.findSentry({});

        expect(ssdRepository.upsertSentryObjects).toHaveBeenCalledWith([
            expect.objectContaining({ designation: "1979 XB", impact_probability: 8.5e-7 }),
        ]);
    });

    it("Scout fica somente em cache, sem persistência", async () => {
        ssdProvider.getScout.mockResolvedValueOnce({ data: [] });

        await service.findScout();

        expect(ssdRepository.upsertCloseApproaches).not.toHaveBeenCalled();
        expect(ssdRepository.upsertSentryObjects).not.toHaveBeenCalled();
    });

    it("syncDailyData segue para os fireballs mesmo com o CAD falhando", async () => {
        ssdProvider.getCloseApproaches.mockRejectedValueOnce(new Error("CAD fora do ar"));
        ssdProvider.getFireballs.mockResolvedValueOnce({ count: 0, fields: [], data: [] });

        await expect(service.syncDailyData()).resolves.toBeUndefined();
        expect(ssdProvider.getFireballs).toHaveBeenCalled();
    });
});
