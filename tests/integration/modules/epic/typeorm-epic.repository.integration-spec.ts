import { DataSource } from "typeorm";
import { EpicImageEntity } from "src/modules/epic/entities/epic-image.entity";
import { TypeOrmEpicRepository } from "src/modules/epic/repositories/typeorm/typeorm-epic.repository";
import { createTestDataSource, truncate } from "tests/support/database";

describe("TypeOrmEpicRepository (integração)", () => {
    let dataSource: DataSource;
    let repository: TypeOrmEpicRepository;

    beforeAll(async () => {
        dataSource = await createTestDataSource();
        repository = new TypeOrmEpicRepository(dataSource.getRepository(EpicImageEntity));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        await truncate(dataSource, ["epic_images"]);
    });

    function image(collection: string, identifier: string, capturedAt: string) {
        return {
            identifier,
            collection,
            captured_on: capturedAt.slice(0, 10),
            captured_at: new Date(capturedAt),
            image: `epic_1b_${identifier}`,
            archive_url: `https://epic.gsfc.nasa.gov/archive/${collection}/x.png`,
            payload: { identifier },
        };
    }

    it("o mesmo identifier convive em natural e enhanced", async () => {
        await repository.upsertMany([
            image("natural", "20240501010101", "2024-05-01T01:01:01Z"),
            image("enhanced", "20240501010101", "2024-05-01T01:01:01Z"),
        ]);

        await expect(repository.findByDate("natural", "2024-05-01")).resolves.toHaveLength(1);
        await expect(repository.findByDate("enhanced", "2024-05-01")).resolves.toHaveLength(1);
    });

    it("findByDate ordena pelo instante da captura", async () => {
        await repository.upsertMany([
            image("natural", "20240501120000", "2024-05-01T12:00:00Z"),
            image("natural", "20240501010101", "2024-05-01T01:01:01Z"),
        ]);

        const result = await repository.findByDate("natural", "2024-05-01");

        expect(result.map((entry) => entry.identifier)).toEqual(["20240501010101", "20240501120000"]);
    });

    it("findLatestDate devolve a data mais recente da coleção", async () => {
        await repository.upsertMany([
            image("natural", "20240501010101", "2024-05-01T01:01:01Z"),
            image("natural", "20240610010101", "2024-06-10T01:01:01Z"),
            image("enhanced", "20241231010101", "2024-12-31T01:01:01Z"),
        ]);

        await expect(repository.findLatestDate("natural")).resolves.toBe("2024-06-10");
        await expect(repository.findLatestDate("enhanced")).resolves.toBe("2024-12-31");
    });

    it("findLatestDate devolve null quando a coleção está vazia", async () => {
        await expect(repository.findLatestDate("natural")).resolves.toBeNull();
    });

    it("findAvailableDates agrupa por dia, sem repetir, do mais recente ao mais antigo", async () => {
        await repository.upsertMany([
            image("natural", "20240501010101", "2024-05-01T01:01:01Z"),
            image("natural", "20240501120000", "2024-05-01T12:00:00Z"),
            image("natural", "20240610010101", "2024-06-10T01:01:01Z"),
            image("enhanced", "20240701010101", "2024-07-01T01:01:01Z"),
        ]);

        await expect(repository.findAvailableDates("natural")).resolves.toEqual(["2024-06-10", "2024-05-01"]);
    });
});
