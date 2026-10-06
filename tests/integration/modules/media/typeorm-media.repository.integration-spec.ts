import { DataSource } from "typeorm";
import { MediaAssetEntity } from "src/modules/media/entities/media-asset.entity";
import { TypeOrmMediaRepository } from "src/modules/media/repositories/typeorm/typeorm-media.repository";
import { createTestDataSource, truncate } from "tests/support/database";

describe("TypeOrmMediaRepository (integração)", () => {
    let dataSource: DataSource;
    let repository: TypeOrmMediaRepository;

    beforeAll(async () => {
        dataSource = await createTestDataSource();
        repository = new TypeOrmMediaRepository(dataSource.getRepository(MediaAssetEntity));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        await truncate(dataSource, ["media_assets"]);
    });

    function asset(nasaId: string, overrides: Partial<MediaAssetEntity> = {}) {
        return {
            nasa_id: nasaId,
            title: `Item ${nasaId}`,
            media_type: "image",
            date_created: new Date("1969-07-19T00:00:00Z"),
            center: "JSC",
            keywords: ["Apollo", "Moon"],
            payload: { href: "https://images-assets.nasa.gov/x", data: [{ nasa_id: nasaId }] },
            ...overrides,
        } as Partial<MediaAssetEntity>;
    }

    it("upsertMany atualiza pelo nasa_id", async () => {
        await repository.upsertMany([asset("as11-42-6179")]);
        await repository.upsertMany([asset("as11-42-6179", { title: "Título revisado" })]);

        const stored = await repository.findByNasaId("as11-42-6179");

        expect(stored?.title).toBe("Título revisado");
    });

    it("preserva o array de keywords e o payload aninhado", async () => {
        await repository.upsertMany([asset("as11-42-6179")]);

        const stored = await repository.findByNasaId("as11-42-6179");

        expect(stored?.keywords).toEqual(["Apollo", "Moon"]);
        expect(stored?.payload.data?.[0]?.nasa_id).toBe("as11-42-6179");
    });

    it("aceita item sem data e sem centro", async () => {
        await repository.upsertMany([asset("sem-metadados", { date_created: null, center: null })]);

        await expect(repository.findByNasaId("sem-metadados")).resolves.toMatchObject({
            date_created: null,
            center: null,
        });
    });

    it("aceita keywords vazias, usando o default da coluna", async () => {
        await repository.upsertMany([asset("sem-keywords", { keywords: [] })]);

        await expect(repository.findByNasaId("sem-keywords")).resolves.toMatchObject({ keywords: [] });
    });
});
