import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { IEpicProvider } from "src/shared/providers/epic/models/epic-provider.interface";
import { createCacheProviderMock } from "src/shared/testing/cache-provider.mock";
import { CACHE_PROVIDER, EPIC_PROVIDER, EPIC_REPOSITORY } from "src/shared/tokens";
import { EpicService } from "./epic.service";
import { IEpicRepository } from "./repositories/epic-repository.interface";

const image = {
    identifier: "20190530011359",
    caption: "Earth",
    image: "epic_1b_20190530011359",
    version: "03",
    date: "2019-05-30 01:09:10",
    centroid_coordinates: { lat: 0, lon: 0 },
    dscovr_j2000_position: { x: 0, y: 0, z: 0 },
    lunar_j2000_position: { x: 0, y: 0, z: 0 },
    sun_j2000_position: { x: 0, y: 0, z: 0 },
    attitude_quaternions: {},
};

describe("EpicService", () => {
    let service: EpicService;
    let epicProvider: jest.Mocked<IEpicProvider>;
    let epicRepository: jest.Mocked<IEpicRepository>;
    let cacheProvider: jest.Mocked<ICacheProvider>;

    beforeEach(async () => {
        epicProvider = {
            getLatest: jest.fn(),
            getByDate: jest.fn(),
            getAvailableDates: jest.fn(),
            buildArchiveUrl: jest.fn(
                (collection, date, imageName) =>
                    `https://epic.gsfc.nasa.gov/archive/${collection}/${date.replace(/-/g, "/")}/png/${imageName}.png`,
            ),
        };
        epicRepository = {
            findByDate: jest.fn(),
            findLatestDate: jest.fn(),
            findAvailableDates: jest.fn(),
            upsertMany: jest.fn(),
        };
        cacheProvider = createCacheProviderMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EpicService,
                { provide: EPIC_PROVIDER, useValue: epicProvider },
                { provide: EPIC_REPOSITORY, useValue: epicRepository },
                { provide: CACHE_PROVIDER, useValue: cacheProvider },
            ],
        }).compile();

        service = module.get<EpicService>(EpicService);
    });

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("acrescenta a URL do arquivo público e persiste a data extraída do timestamp", async () => {
        epicProvider.getLatest.mockResolvedValueOnce([image]);

        const result = await service.findLatest("natural");

        expect(result[0].archive_url).toBe(
            "https://epic.gsfc.nasa.gov/archive/natural/2019/05/30/png/epic_1b_20190530011359.png",
        );
        expect(epicRepository.upsertMany).toHaveBeenCalledWith([
            expect.objectContaining({
                collection: "natural",
                captured_on: "2019-05-30",
                captured_at: new Date("2019-05-30T01:09:10Z"),
            }),
        ]);
    });

    it("findByDate usa o banco sem chamar o upstream", async () => {
        epicRepository.findByDate.mockResolvedValueOnce([
            { payload: image, archive_url: "https://example.com/x.png" } as never,
        ]);

        const result = await service.findByDate("natural", "2019-05-30");

        expect(result[0].archive_url).toBe("https://example.com/x.png");
        expect(epicProvider.getByDate).not.toHaveBeenCalled();
    });

    it("lança NotFoundException quando não há imagem na data", async () => {
        epicRepository.findByDate.mockResolvedValueOnce([]);
        epicProvider.getByDate.mockResolvedValueOnce([]);

        await expect(service.findByDate("natural", "1990-01-01")).rejects.toBeInstanceOf(NotFoundException);
    });

    it("syncLatest tenta as duas coleções mesmo quando uma falha", async () => {
        epicProvider.getLatest.mockRejectedValueOnce(new Error("EPIC fora do ar")).mockResolvedValueOnce([image]);

        await expect(service.syncLatest()).resolves.toBeUndefined();
        expect(epicProvider.getLatest).toHaveBeenCalledTimes(2);
    });
});
