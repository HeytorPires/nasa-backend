import { DataSource } from "typeorm";
import { SsdCloseApproachEntity } from "src/modules/ssd/entities/ssd-close-approach.entity";
import { SsdFireballEntity } from "src/modules/ssd/entities/ssd-fireball.entity";
import { SsdSentryObjectEntity } from "src/modules/ssd/entities/ssd-sentry-object.entity";
import { TypeOrmSsdRepository } from "src/modules/ssd/repositories/typeorm/typeorm-ssd.repository";
import { createTestDataSource, truncate } from "tests/support/database";

describe("TypeOrmSsdRepository (integração)", () => {
    let dataSource: DataSource;
    let repository: TypeOrmSsdRepository;

    beforeAll(async () => {
        dataSource = await createTestDataSource();
        repository = new TypeOrmSsdRepository(
            dataSource.getRepository(SsdCloseApproachEntity),
            dataSource.getRepository(SsdFireballEntity),
            dataSource.getRepository(SsdSentryObjectEntity),
        );
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        await truncate(dataSource, ["ssd_close_approaches", "ssd_fireballs", "ssd_sentry_objects"]);
    });

    describe("aproximações", () => {
        const approach = {
            designation: "2024 AV2",
            close_approach_at: new Date("2024-01-01T02:47:00Z"),
            distance_au: 0.00970740988664553,
            relative_velocity_kms: 8.06343461087769,
            payload: { des: "2024 AV2" },
        };

        it("o mesmo objeto guarda uma linha por aproximação", async () => {
            await repository.upsertCloseApproaches([
                approach,
                { ...approach, close_approach_at: new Date("2025-06-01T00:00:00Z") },
            ]);

            await expect(dataSource.getRepository(SsdCloseApproachEntity).count()).resolves.toBe(2);
        });

        it("repetir designação e instante atualiza em vez de duplicar", async () => {
            await repository.upsertCloseApproaches([approach]);
            await repository.upsertCloseApproaches([{ ...approach, distance_au: 0.5 }]);

            const [stored] = await dataSource.getRepository(SsdCloseApproachEntity).find();

            expect(stored.distance_au).toBeCloseTo(0.5);
        });

        it("preserva a precisão do double na distância em unidades astronômicas", async () => {
            await repository.upsertCloseApproaches([approach]);

            const [stored] = await dataSource.getRepository(SsdCloseApproachEntity).find();

            expect(stored.distance_au).toBe(0.00970740988664553);
        });
    });

    describe("bolas de fogo", () => {
        const fireball = {
            observed_at: new Date("2026-09-10T05:22:22Z"),
            latitude: -19.3,
            longitude: -28.1,
            impact_energy: 0.33,
            payload: { date: "2026-09-10 05:22:22" },
        };

        it("instante mais posição formam a chave natural", async () => {
            await repository.upsertFireballs([fireball]);
            await repository.upsertFireballs([{ ...fireball, impact_energy: 1.5 }]);

            const rows = await dataSource.getRepository(SsdFireballEntity).find();

            expect(rows).toHaveLength(1);
            expect(rows[0].impact_energy).toBeCloseTo(1.5);
        });

        it("guarda coordenadas com sinal do hemisfério", async () => {
            await repository.upsertFireballs([fireball]);

            const [stored] = await dataSource.getRepository(SsdFireballEntity).find();

            expect(stored.latitude).toBeCloseTo(-19.3);
            expect(stored.longitude).toBeCloseTo(-28.1);
        });
    });

    describe("objetos do Sentry", () => {
        it("atualiza pela designação", async () => {
            const sentry = {
                designation: "1979 XB",
                fullname: "(1979 XB)",
                impact_probability: 8.515158e-7,
                palermo_scale_cumulative: -2.69,
                payload: { des: "1979 XB" },
            };

            await repository.upsertSentryObjects([sentry]);
            await repository.upsertSentryObjects([{ ...sentry, impact_probability: 1e-6 }]);

            const rows = await dataSource.getRepository(SsdSentryObjectEntity).find();

            expect(rows).toHaveLength(1);
            expect(rows[0].impact_probability).toBeCloseTo(1e-6);
        });
    });

    it("nenhum dos upserts vai ao banco com lista vazia", async () => {
        await expect(repository.upsertCloseApproaches([])).resolves.toBeUndefined();
        await expect(repository.upsertFireballs([])).resolves.toBeUndefined();
        await expect(repository.upsertSentryObjects([])).resolves.toBeUndefined();
    });
});
