import { DataSource } from "typeorm";
import { ExoplanetEntity } from "src/modules/exoplanets/entities/exoplanet.entity";
import { TypeOrmExoplanetRepository } from "src/modules/exoplanets/repositories/typeorm/typeorm-exoplanet.repository";
import { createTestDataSource, truncate } from "tests/support/database";

describe("TypeOrmExoplanetRepository (integração)", () => {
    let dataSource: DataSource;
    let repository: TypeOrmExoplanetRepository;

    beforeAll(async () => {
        dataSource = await createTestDataSource();
        repository = new TypeOrmExoplanetRepository(dataSource.getRepository(ExoplanetEntity));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        await truncate(dataSource, ["exoplanets"]);
    });

    function planet(name: string, overrides: Partial<ExoplanetEntity> = {}) {
        return {
            pl_name: name,
            hostname: "HD 2039",
            disc_year: 2002,
            discoverymethod: "Radial Velocity",
            payload: { pl_name: name, pl_orbper: 1120, sy_dist: 85.6922 },
            ...overrides,
        } as Partial<ExoplanetEntity>;
    }

    it("upsertMany atualiza pelo nome do planeta", async () => {
        await repository.upsertMany([planet("HD 2039 b")]);
        await repository.upsertMany([planet("HD 2039 b", { discoverymethod: "Transit" })]);

        const stored = await repository.findByName("HD 2039 b");

        expect(stored?.discoverymethod).toBe("Transit");
        await expect(dataSource.getRepository(ExoplanetEntity).count()).resolves.toBe(1);
    });

    it("aceita nome com espaço, que é o formato do arquivo", async () => {
        await repository.upsertMany([planet("HAT-P-8 b", { hostname: "HAT-P-8" })]);

        await expect(repository.findByName("HAT-P-8 b")).resolves.toMatchObject({ hostname: "HAT-P-8" });
    });

    it("preserva os números do payload sem virar string", async () => {
        await repository.upsertMany([planet("HD 2039 b")]);

        const stored = await repository.findByName("HD 2039 b");

        expect(stored?.payload.sy_dist).toBe(85.6922);
    });

    it("aceita planeta sem ano nem método de descoberta", async () => {
        await repository.upsertMany([planet("Sem dados", { disc_year: null, discoverymethod: null })]);

        await expect(repository.findByName("Sem dados")).resolves.toMatchObject({
            disc_year: null,
            discoverymethod: null,
        });
    });
});
