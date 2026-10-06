import { DataSource } from "typeorm";
import { MarsWeatherSolEntity } from "src/modules/mars-weather/entities/mars-weather-sol.entity";
import { TypeOrmMarsWeatherRepository } from "src/modules/mars-weather/repositories/typeorm/typeorm-mars-weather.repository";
import { createTestDataSource, truncate } from "tests/support/database";

describe("TypeOrmMarsWeatherRepository (integração)", () => {
    let dataSource: DataSource;
    let repository: TypeOrmMarsWeatherRepository;

    beforeAll(async () => {
        dataSource = await createTestDataSource();
        repository = new TypeOrmMarsWeatherRepository(dataSource.getRepository(MarsWeatherSolEntity));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        await truncate(dataSource, ["mars_weather_sols"]);
    });

    function sol(number: number, averageTemperature: number | null = -62.3) {
        return {
            sol: number,
            first_utc: new Date("2020-10-19T18:32:20Z"),
            last_utc: new Date("2020-10-20T19:11:55Z"),
            season: "fall",
            average_temperature: averageTemperature,
            payload: { Season: "fall", First_UTC: "2020-10-19T18:32:20Z", Last_UTC: "2020-10-20T19:11:55Z" },
        };
    }

    it("recalcula o mesmo sol em vez de duplicar", async () => {
        await repository.upsertMany([sol(675, -62.3)]);
        await repository.upsertMany([sol(675, -60.1)]);

        const stored = await repository.findBySol(675);

        expect(stored?.average_temperature).toBeCloseTo(-60.1);
    });

    it("findLatest devolve os sols mais recentes primeiro, respeitando o limite", async () => {
        await repository.upsertMany([sol(675), sol(676), sol(677)]);

        const result = await repository.findLatest(2);

        expect(result.map((entry) => entry.sol)).toEqual([677, 676]);
    });

    it("aceita sol sem leitura de temperatura", async () => {
        await repository.upsertMany([sol(700, null)]);

        await expect(repository.findBySol(700)).resolves.toMatchObject({ average_temperature: null });
    });

    it("findBySol devolve null para um sol ausente", async () => {
        await expect(repository.findBySol(1)).resolves.toBeNull();
    });
});
