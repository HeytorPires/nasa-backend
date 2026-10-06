import { Test, TestingModule } from "@nestjs/testing";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { ITechTransferProvider } from "src/shared/providers/tech-transfer/models/tech-transfer-provider.interface";
import { createCacheProviderMock } from "src/shared/testing/cache-provider.mock";
import { CACHE_PROVIDER, TECH_TRANSFER_PROVIDER, TECH_TRANSFER_REPOSITORY } from "src/shared/tokens";
import { ITechTransferRepository } from "./repositories/tech-transfer-repository.interface";
import { TechTransferService } from "./tech-transfer.service";

const item = {
    id: "64e71c1a64038afc1d0a01d2",
    case_number: "LEW-TOPS-168",
    title: "Closed Strayton Engine",
    description: "Gerador leve.",
    category: "Power Generation and Storage",
    center: "GRC",
    image_url: null,
};

describe("TechTransferService", () => {
    let service: TechTransferService;
    let techTransferProvider: jest.Mocked<ITechTransferProvider>;
    let techTransferRepository: jest.Mocked<ITechTransferRepository>;
    let cacheProvider: jest.Mocked<ICacheProvider>;

    beforeEach(async () => {
        techTransferProvider = { search: jest.fn() };
        techTransferRepository = { upsertMany: jest.fn() };
        cacheProvider = createCacheProviderMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TechTransferService,
                { provide: TECH_TRANSFER_PROVIDER, useValue: techTransferProvider },
                { provide: TECH_TRANSFER_REPOSITORY, useValue: techTransferRepository },
                { provide: CACHE_PROVIDER, useValue: cacheProvider },
            ],
        }).compile();

        service = module.get<TechTransferService>(TechTransferService);
    });

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("persiste os resultados com a categoria consultada", async () => {
        techTransferProvider.search.mockResolvedValueOnce({
            results: [item],
            count: 1,
            total: 1,
            page: 1,
            perpage: 10,
        });

        await service.search("patent", "engine");

        expect(techTransferRepository.upsertMany).toHaveBeenCalledWith([
            expect.objectContaining({ category: "patent", external_id: item.id, center: "GRC" }),
        ]);
    });

    it("usa a mesma chave de cache independente da caixa do termo", async () => {
        techTransferProvider.search.mockResolvedValue({ results: [], count: 0, total: 0, page: 1, perpage: 10 });

        await service.search("patent", "Engine");
        await service.search("patent", "engine");

        expect(cacheProvider.getOrSet.mock.calls[0][0]).toBe(cacheProvider.getOrSet.mock.calls[1][0]);
    });
});
