import { Test, TestingModule } from "@nestjs/testing";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { IEonetProvider } from "src/shared/providers/eonet/models/eonet-provider.interface";
import { CACHE_PROVIDER, EONET_PROVIDER, EONET_REPOSITORY } from "src/shared/tokens";
import { EonetEventEntity } from "./entities/eonet-event.entity";
import { EonetService } from "./eonet.service";
import { IEonetRepository } from "./repositories/eonet-repository.interface";

import type { EonetEvent } from "src/shared/providers/eonet/models/eonet-response.interface";

const event: EonetEvent = {
    id: "EONET_1",
    title: "Tropical Storm",
    description: null,
    link: "https://eonet.gsfc.nasa.gov/api/v3/events/EONET_1",
    closed: null,
    categories: [{ id: "severeStorms", title: "Severe Storms" }],
    sources: [{ id: "JTWC", url: "https://example.com" }],
    geometry: [
        { date: "2024-05-01T00:00:00Z", type: "Point", coordinates: [0, 0] },
        { date: "2024-05-03T00:00:00Z", type: "Point", coordinates: [1, 1] },
    ],
};

describe("EonetService", () => {
    let service: EonetService;
    let eonetProvider: jest.Mocked<IEonetProvider>;
    let eonetRepository: jest.Mocked<IEonetRepository>;
    let cacheProvider: jest.Mocked<ICacheProvider>;

    beforeEach(async () => {
        eonetProvider = {
            getEvents: jest.fn(),
            getCategories: jest.fn(),
            getSources: jest.fn(),
            getLayers: jest.fn(),
        };

        eonetRepository = {
            findEvents: jest.fn(),
            findByEonetId: jest.fn(),
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
                EonetService,
                { provide: EONET_PROVIDER, useValue: eonetProvider },
                { provide: EONET_REPOSITORY, useValue: eonetRepository },
                { provide: CACHE_PROVIDER, useValue: cacheProvider },
            ],
        }).compile();

        service = module.get<EonetService>(EonetService);
    });

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("devolve os eventos do banco sem chamar o EONET", async () => {
        eonetRepository.findEvents.mockResolvedValueOnce([{ payload: event } as EonetEventEntity]);

        await expect(service.findEvents({ status: "open" })).resolves.toEqual([event]);
        expect(eonetProvider.getEvents).not.toHaveBeenCalled();
    });

    it("busca no EONET e persiste quando o banco está vazio", async () => {
        eonetRepository.findEvents.mockResolvedValueOnce([]);
        eonetProvider.getEvents.mockResolvedValueOnce([event]);

        await expect(service.findEvents({ status: "open" })).resolves.toEqual([event]);
        expect(eonetRepository.upsertMany).toHaveBeenCalledWith([
            expect.objectContaining({
                eonet_id: "EONET_1",
                category_ids: ["severeStorms"],
                closed: null,
                last_geometry_at: new Date("2024-05-03T00:00:00Z"),
            }),
        ]);
    });

    it("usa chaves de cache distintas por combinação de filtros", async () => {
        eonetRepository.findEvents.mockResolvedValue([{ payload: event } as EonetEventEntity]);

        await service.findEvents({ status: "open", category: "wildfires", limit: 10 });
        await service.findEvents({ status: "closed", limit: 10 });

        const [firstKey] = cacheProvider.getOrSet.mock.calls[0];
        const [secondKey] = cacheProvider.getOrSet.mock.calls[1];
        expect(firstKey).not.toBe(secondKey);
    });

    it("syncOpenEvents não propaga falha do upstream", async () => {
        eonetProvider.getEvents.mockRejectedValueOnce(new Error("EONET fora do ar"));

        await expect(service.syncOpenEvents()).resolves.toBeUndefined();
        expect(eonetRepository.upsertMany).not.toHaveBeenCalled();
    });
});
