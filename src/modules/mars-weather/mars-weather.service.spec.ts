import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { IMarsWeatherProvider } from "src/shared/providers/mars-weather/models/mars-weather-provider.interface";
import { createCacheProviderMock } from "src/shared/testing/cache-provider.mock";
import { CACHE_PROVIDER, MARS_WEATHER_PROVIDER, MARS_WEATHER_REPOSITORY } from "src/shared/tokens";
import { MarsWeatherSolEntity } from "./entities/mars-weather-sol.entity";
import { MarsWeatherService } from "./mars-weather.service";
import { IMarsWeatherRepository } from "./repositories/mars-weather-repository.interface";

const upstreamResponse = {
    "675": {
        AT: { av: -62.3, ct: 1, mn: -96.8, mx: -15.9 },
        First_UTC: "2020-10-19T18:32:20Z",
        Last_UTC: "2020-10-20T19:11:55Z",
        Season: "fall",
    },
    "676": {
        AT: { av: -60.1, ct: 1, mn: -95, mx: -14 },
        First_UTC: "2020-10-20T19:11:55Z",
        Last_UTC: "2020-10-21T19:51:30Z",
        Season: "fall",
    },
    sol_keys: ["675", "676"],
    validity_checks: {},
};

describe("MarsWeatherService", () => {
    let service: MarsWeatherService;
    let marsWeatherProvider: jest.Mocked<IMarsWeatherProvider>;
    let marsWeatherRepository: jest.Mocked<IMarsWeatherRepository>;
    let cacheProvider: jest.Mocked<ICacheProvider>;

    beforeEach(async () => {
        marsWeatherProvider = { getLatest: jest.fn() };
        marsWeatherRepository = { findLatest: jest.fn(), findBySol: jest.fn(), upsertMany: jest.fn() };
        cacheProvider = createCacheProviderMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MarsWeatherService,
                { provide: MARS_WEATHER_PROVIDER, useValue: marsWeatherProvider },
                { provide: MARS_WEATHER_REPOSITORY, useValue: marsWeatherRepository },
                { provide: CACHE_PROVIDER, useValue: cacheProvider },
            ],
        }).compile();

        service = module.get<MarsWeatherService>(MarsWeatherService);
    });

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("achata os sols e devolve do mais recente para o mais antigo", async () => {
        marsWeatherProvider.getLatest.mockResolvedValueOnce(upstreamResponse);

        const result = await service.findLatest();

        expect(result.map((entry) => entry.sol)).toEqual([676, 675]);
        expect(marsWeatherRepository.upsertMany).toHaveBeenCalledWith([
            expect.objectContaining({ sol: 676, average_temperature: -60.1, season: "fall" }),
            expect.objectContaining({ sol: 675, average_temperature: -62.3 }),
        ]);
    });

    it("cai para o histórico do banco quando o InSight está sem downlink", async () => {
        marsWeatherProvider.getLatest.mockResolvedValueOnce({ sol_keys: [] });
        marsWeatherRepository.findLatest.mockResolvedValueOnce([
            { sol: 500, payload: { First_UTC: "", Last_UTC: "", Season: "winter" } } as MarsWeatherSolEntity,
        ]);

        const result = await service.findLatest();

        expect(result).toEqual([{ sol: 500, First_UTC: "", Last_UTC: "", Season: "winter" }]);
    });

    it("findBySol usa o banco antes do upstream", async () => {
        marsWeatherRepository.findBySol.mockResolvedValueOnce({
            sol: 675,
            payload: { First_UTC: "", Last_UTC: "", Season: "fall" },
        } as MarsWeatherSolEntity);

        await expect(service.findBySol(675)).resolves.toMatchObject({ sol: 675 });
        expect(marsWeatherProvider.getLatest).not.toHaveBeenCalled();
    });

    it("lança NotFoundException para um sol que não existe em lugar nenhum", async () => {
        marsWeatherRepository.findBySol.mockResolvedValueOnce(null);
        marsWeatherProvider.getLatest.mockResolvedValueOnce(upstreamResponse);

        await expect(service.findBySol(1)).rejects.toBeInstanceOf(NotFoundException);
    });

    it("syncLatest não propaga falha do upstream", async () => {
        marsWeatherProvider.getLatest.mockRejectedValueOnce(new Error("InSight indisponível"));

        await expect(service.syncLatest()).resolves.toBeUndefined();
    });
});
