import { Test, TestingModule } from "@nestjs/testing";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { IMediaProvider } from "src/shared/providers/media/models/media-provider.interface";
import { createCacheProviderMock } from "src/shared/testing/cache-provider.mock";
import { CACHE_PROVIDER, MEDIA_PROVIDER, MEDIA_REPOSITORY } from "src/shared/tokens";
import { MediaService } from "./media.service";
import { IMediaRepository } from "./repositories/media-repository.interface";

import type { MediaSearchResponse } from "src/shared/providers/media/models/media-response.interface";

function searchResponse(items: unknown[]): MediaSearchResponse {
    return {
        collection: { version: "1.0", href: "", items: items as never, metadata: { total_hits: items.length } },
    };
}

describe("MediaService", () => {
    let service: MediaService;
    let mediaProvider: jest.Mocked<IMediaProvider>;
    let mediaRepository: jest.Mocked<IMediaRepository>;
    let cacheProvider: jest.Mocked<ICacheProvider>;

    beforeEach(async () => {
        mediaProvider = {
            search: jest.fn(),
            getAsset: jest.fn(),
            getMetadataLocation: jest.fn(),
            getCaptionsLocation: jest.fn(),
        };
        mediaRepository = { findByNasaId: jest.fn(), upsertMany: jest.fn() };
        cacheProvider = createCacheProviderMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MediaService,
                { provide: MEDIA_PROVIDER, useValue: mediaProvider },
                { provide: MEDIA_REPOSITORY, useValue: mediaRepository },
                { provide: CACHE_PROVIDER, useValue: cacheProvider },
            ],
        }).compile();

        service = module.get<MediaService>(MediaService);
    });

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("extrai os campos de data[0] para as colunas indexadas", async () => {
        mediaProvider.search.mockResolvedValueOnce(
            searchResponse([
                {
                    href: "https://images-assets.nasa.gov/image/as11/collection.json",
                    data: [
                        {
                            nasa_id: "as11-42-6179",
                            title: "Solar Corona",
                            media_type: "image",
                            date_created: "1969-07-19T00:00:00Z",
                            center: "JSC",
                            keywords: ["Apollo"],
                        },
                    ],
                },
            ]),
        );

        await service.search({ q: "apollo" });

        expect(mediaRepository.upsertMany).toHaveBeenCalledWith([
            expect.objectContaining({
                nasa_id: "as11-42-6179",
                center: "JSC",
                keywords: ["Apollo"],
                date_created: new Date("1969-07-19T00:00:00Z"),
            }),
        ]);
    });

    it("descarta itens sem data[0].nasa_id", async () => {
        mediaProvider.search.mockResolvedValueOnce(searchResponse([{ href: "x", data: [] }]));

        await service.search({ q: "vazio" });

        expect(mediaRepository.upsertMany).not.toHaveBeenCalled();
    });

    it("usa chaves de cache distintas por combinação de filtros", async () => {
        mediaProvider.search.mockResolvedValue(searchResponse([]));

        await service.search({ q: "moon" });
        await service.search({ q: "moon", mediaType: "video" });

        expect(cacheProvider.getOrSet.mock.calls[0][0]).not.toBe(cacheProvider.getOrSet.mock.calls[1][0]);
    });
});
