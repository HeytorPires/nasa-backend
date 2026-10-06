import { ServiceUnavailableException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { createCacheProviderMock } from "src/shared/testing/cache-provider.mock";
import { CACHE_PROVIDER } from "src/shared/tokens";
import { HEALTH_CHECK_TIMEOUT_MS, HealthController } from "./health.controller";

describe("HealthController", () => {
    let controller: HealthController;
    const dataSource = { query: jest.fn() };
    const cacheProvider = createCacheProviderMock();

    beforeEach(async () => {
        jest.resetAllMocks();

        const moduleRef = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [
                { provide: DataSource, useValue: dataSource },
                { provide: CACHE_PROVIDER, useValue: cacheProvider },
            ],
        }).compile();

        controller = moduleRef.get(HealthController);
    });

    it("responde ok quando Postgres e Redis respondem", async () => {
        dataSource.query.mockResolvedValue([{ "?column?": 1 }]);
        cacheProvider.ping.mockResolvedValue();

        await expect(controller.check()).resolves.toEqual({ status: "ok" });
        expect(dataSource.query).toHaveBeenCalledWith("SELECT 1");
    });

    it("responde 503 quando o Postgres falha", async () => {
        dataSource.query.mockRejectedValue(new Error("connection refused"));
        cacheProvider.ping.mockResolvedValue();

        await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it("responde 503 quando o Redis falha", async () => {
        dataSource.query.mockResolvedValue([]);
        cacheProvider.ping.mockRejectedValue(new Error("ECONNREFUSED"));

        await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it("responde 503 quando o Redis não responde dentro do timeout", async () => {
        jest.useFakeTimers();
        dataSource.query.mockResolvedValue([]);
        cacheProvider.ping.mockReturnValue(new Promise(() => undefined));

        const result = controller.check();
        jest.advanceTimersByTime(HEALTH_CHECK_TIMEOUT_MS);

        await expect(result).rejects.toBeInstanceOf(ServiceUnavailableException);
        jest.useRealTimers();
    });
});
