import { DataSource } from "typeorm";
import { TleRecordEntity } from "src/modules/tle/entities/tle-record.entity";
import { TypeOrmTleRepository } from "src/modules/tle/repositories/typeorm/typeorm-tle.repository";
import { createTestDataSource, truncate } from "tests/support/database";

describe("TypeOrmTleRepository (integração)", () => {
    let dataSource: DataSource;
    let repository: TypeOrmTleRepository;

    beforeAll(async () => {
        dataSource = await createTestDataSource();
        repository = new TypeOrmTleRepository(dataSource.getRepository(TleRecordEntity));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        await truncate(dataSource, ["tle_records"]);
    });

    function record(satelliteId: number, epoch: string) {
        return {
            satellite_id: satelliteId,
            name: `SAT ${satelliteId}`,
            epoch: new Date(epoch),
            line1: "1 25544U ...",
            line2: "2 25544 ...",
        };
    }

    it("guarda uma linha por época do mesmo satélite", async () => {
        await repository.upsertMany([record(25544, "2026-09-09T00:00:00Z"), record(25544, "2026-09-10T00:00:00Z")]);

        const latest = await repository.findLatestBySatelliteId(25544);

        expect(latest?.epoch).toEqual(new Date("2026-09-10T00:00:00Z"));
        await expect(dataSource.getRepository(TleRecordEntity).count({ where: { satellite_id: 25544 } })).resolves.toBe(
            2,
        );
    });

    it("a mesma época repetida atualiza em vez de duplicar", async () => {
        await repository.upsertMany([record(25544, "2026-09-10T00:00:00Z")]);
        await repository.upsertMany([{ ...record(25544, "2026-09-10T00:00:00Z"), name: "ISS (ZARYA)" }]);

        const latest = await repository.findLatestBySatelliteId(25544);

        expect(latest?.name).toBe("ISS (ZARYA)");
    });

    it("findTrackedSatelliteIds ordena pela época mais recente de cada satélite", async () => {
        await repository.upsertMany([
            record(1, "2026-01-01T00:00:00Z"),
            record(2, "2026-09-01T00:00:00Z"),
            record(3, "2026-05-01T00:00:00Z"),
            record(2, "2020-01-01T00:00:00Z"),
        ]);

        await expect(repository.findTrackedSatelliteIds(10)).resolves.toEqual([2, 3, 1]);
    });

    it("findTrackedSatelliteIds respeita o limite", async () => {
        await repository.upsertMany([record(1, "2026-01-01T00:00:00Z"), record(2, "2026-09-01T00:00:00Z")]);

        await expect(repository.findTrackedSatelliteIds(1)).resolves.toEqual([2]);
    });

    it("findLatestBySatelliteId devolve null para satélite desconhecido", async () => {
        await expect(repository.findLatestBySatelliteId(99999)).resolves.toBeNull();
    });
});
