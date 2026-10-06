import { Test, TestingModule } from "@nestjs/testing";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { INeoProvider } from "src/shared/providers/neo/models/neo-provider.interface";
import { createCacheProviderMock } from "src/shared/testing/cache-provider.mock";
import { CACHE_PROVIDER, NEO_PROVIDER, NEO_REPOSITORY } from "src/shared/tokens";
import { NeoFeedDayEntity } from "./entities/neo-feed-day.entity";
import { NeoObjectEntity } from "./entities/neo-object.entity";
import { NeoService } from "./neo.service";
import { INeoRepository } from "./repositories/neo-repository.interface";

import type { NeoObject } from "src/shared/providers/neo/models/neo-response.interface";

const neoObject = {
    id: "3542519",
    neo_reference_id: "3542519",
    name: "(2010 PK9)",
    nasa_jpl_url: "https://ssd.jpl.nasa.gov/",
    absolute_magnitude_h: 21.85,
    estimated_diameter: {},
    is_potentially_hazardous_asteroid: false,
    is_sentry_object: false,
    close_approach_data: [],
} as NeoObject;

describe("NeoService", () => {
    let service: NeoService;
    let neoProvider: jest.Mocked<INeoProvider>;
    let neoRepository: jest.Mocked<INeoRepository>;
    let cacheProvider: jest.Mocked<ICacheProvider>;

    beforeEach(async () => {
        neoProvider = { getFeed: jest.fn(), getById: jest.fn(), browse: jest.fn() };
        neoRepository = {
            findObjectByReferenceId: jest.fn(),
            findObjectsByReferenceIds: jest.fn(),
            upsertObjects: jest.fn(),
            findFeedDays: jest.fn(),
            upsertFeedDays: jest.fn(),
        };
        cacheProvider = createCacheProviderMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NeoService,
                { provide: NEO_PROVIDER, useValue: neoProvider },
                { provide: NEO_REPOSITORY, useValue: neoRepository },
                { provide: CACHE_PROVIDER, useValue: cacheProvider },
            ],
        }).compile();

        service = module.get<NeoService>(NeoService);
    });

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("reconstrói o feed a partir do banco quando todos os dias estão registrados", async () => {
        neoRepository.findFeedDays.mockResolvedValueOnce([
            { date: "2024-05-01", neo_reference_ids: ["3542519"] } as NeoFeedDayEntity,
            { date: "2024-05-02", neo_reference_ids: [] } as unknown as NeoFeedDayEntity,
        ]);
        neoRepository.findObjectsByReferenceIds.mockResolvedValueOnce([
            { neo_reference_id: "3542519", payload: neoObject } as NeoObjectEntity,
        ]);

        const feed = await service.findFeed("2024-05-01", "2024-05-02");

        expect(neoProvider.getFeed).not.toHaveBeenCalled();
        expect(feed.element_count).toBe(1);
        expect(feed.near_earth_objects["2024-05-01"]).toEqual([neoObject]);
        expect(feed.near_earth_objects["2024-05-02"]).toEqual([]);
    });

    it("busca no upstream quando falta algum dia e registra objetos e dias", async () => {
        neoRepository.findFeedDays.mockResolvedValueOnce([]);
        neoProvider.getFeed.mockResolvedValueOnce({
            element_count: 1,
            near_earth_objects: { "2024-05-01": [neoObject] },
        });

        await service.findFeed("2024-05-01", "2024-05-02");

        expect(neoRepository.upsertObjects).toHaveBeenCalledWith([
            expect.objectContaining({ neo_reference_id: "3542519" }),
        ]);
        expect(neoRepository.upsertFeedDays).toHaveBeenCalledWith([
            expect.objectContaining({ date: "2024-05-01", element_count: 1 }),
        ]);
    });

    it("findById devolve o registro do banco sem chamar o upstream", async () => {
        neoRepository.findObjectByReferenceId.mockResolvedValueOnce({
            payload: neoObject,
        } as NeoObjectEntity);

        await expect(service.findById("3542519")).resolves.toEqual(neoObject);
        expect(neoProvider.getById).not.toHaveBeenCalled();
    });

    it("syncYesterdayFeed não propaga falha do upstream", async () => {
        neoProvider.getFeed.mockRejectedValueOnce(new Error("NeoWs indisponível"));

        await expect(service.syncYesterdayFeed()).resolves.toBeUndefined();
    });
});
