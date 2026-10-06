import { Test, TestingModule } from "@nestjs/testing";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { IDonkiProvider } from "src/shared/providers/donki/models/donki-provider.interface";
import { createCacheProviderMock } from "src/shared/testing/cache-provider.mock";
import { CACHE_PROVIDER, DONKI_PROVIDER, DONKI_REPOSITORY } from "src/shared/tokens";
import { DonkiService } from "./donki.service";
import { DonkiEventEntity } from "./entities/donki-event.entity";
import { IDonkiRepository } from "./repositories/donki-repository.interface";

const cmeEvent = { activityID: "2024-05-01T12:00:00-CME-001", startTime: "2024-05-01T12:00Z", note: "x" };

describe("DonkiService", () => {
    let service: DonkiService;
    let donkiProvider: jest.Mocked<IDonkiProvider>;
    let donkiRepository: jest.Mocked<IDonkiRepository>;
    let cacheProvider: jest.Mocked<ICacheProvider>;

    beforeEach(async () => {
        donkiProvider = { getEvents: jest.fn() };
        donkiRepository = { findByTypeAndRange: jest.fn(), upsertMany: jest.fn() };
        cacheProvider = createCacheProviderMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DonkiService,
                { provide: DONKI_PROVIDER, useValue: donkiProvider },
                { provide: DONKI_REPOSITORY, useValue: donkiRepository },
                { provide: CACHE_PROVIDER, useValue: cacheProvider },
            ],
        }).compile();

        service = module.get<DonkiService>(DonkiService);
    });

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("devolve os eventos do banco sem chamar o upstream", async () => {
        donkiRepository.findByTypeAndRange.mockResolvedValueOnce([
            { payload: cmeEvent } as unknown as DonkiEventEntity,
        ]);

        await expect(service.findEvents("cme", { startDate: "2024-05-01", endDate: "2024-05-10" })).resolves.toEqual([
            cmeEvent,
        ]);
        expect(donkiProvider.getEvents).not.toHaveBeenCalled();
    });

    it("extrai id e instante conforme o campo de cada serviço", async () => {
        donkiRepository.findByTypeAndRange.mockResolvedValueOnce([]);
        donkiProvider.getEvents.mockResolvedValueOnce([{ flrID: "FLR-1", beginTime: "2024-05-01T00:00Z" }]);

        await service.findEvents("flr", { startDate: "2024-05-01", endDate: "2024-05-10" });

        expect(donkiRepository.upsertMany).toHaveBeenCalledWith([
            expect.objectContaining({
                event_type: "flr",
                activity_id: "FLR-1",
                event_time: new Date("2024-05-01T00:00Z"),
            }),
        ]);
    });

    it("descarta eventos sem identificador, que não têm chave natural para o upsert", async () => {
        donkiRepository.findByTypeAndRange.mockResolvedValueOnce([]);
        donkiProvider.getEvents.mockResolvedValueOnce([{ note: "sem id" }]);

        await service.findEvents("cme", { startDate: "2024-05-01", endDate: "2024-05-10" });

        expect(donkiRepository.upsertMany).not.toHaveBeenCalled();
    });

    it("ignora o banco quando há filtros que ele não reproduz", async () => {
        donkiProvider.getEvents.mockResolvedValueOnce([]);

        await service.findEvents("cme-analysis", { startDate: "2024-05-01", endDate: "2024-05-10", speed: 500 });

        expect(donkiRepository.findByTypeAndRange).not.toHaveBeenCalled();
        expect(donkiProvider.getEvents).toHaveBeenCalled();
    });

    it("syncRecentEvents segue para o próximo tipo quando um falha", async () => {
        donkiProvider.getEvents.mockRejectedValue(new Error("DONKI fora do ar"));

        await expect(service.syncRecentEvents()).resolves.toBeUndefined();
        expect(donkiProvider.getEvents).toHaveBeenCalledTimes(11);
    });
});
