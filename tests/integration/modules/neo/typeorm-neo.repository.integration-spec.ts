import { DataSource } from "typeorm";
import { NeoFeedDayEntity } from "src/modules/neo/entities/neo-feed-day.entity";
import { NeoObjectEntity } from "src/modules/neo/entities/neo-object.entity";
import { TypeOrmNeoRepository } from "src/modules/neo/repositories/typeorm/typeorm-neo.repository";
import { createTestDataSource, truncate } from "tests/support/database";

import type { NeoObject } from "src/shared/providers/neo/models/neo-response.interface";

describe("TypeOrmNeoRepository (integração)", () => {
    let dataSource: DataSource;
    let repository: TypeOrmNeoRepository;

    beforeAll(async () => {
        dataSource = await createTestDataSource();
        repository = new TypeOrmNeoRepository(
            dataSource.getRepository(NeoObjectEntity),
            dataSource.getRepository(NeoFeedDayEntity),
        );
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        await truncate(dataSource, ["neo_objects", "neo_feed_days"]);
    });

    function neoObject(referenceId: string, overrides: Partial<NeoObject> = {}) {
        const payload = {
            id: referenceId,
            neo_reference_id: referenceId,
            name: `(${referenceId})`,
            nasa_jpl_url: "https://ssd.jpl.nasa.gov/",
            absolute_magnitude_h: 21.85,
            estimated_diameter: { kilometers: { estimated_diameter_min: 0.1, estimated_diameter_max: 0.2 } },
            is_potentially_hazardous_asteroid: false,
            is_sentry_object: false,
            close_approach_data: [{ close_approach_date: "2024-05-01", orbiting_body: "Earth" }],
            ...overrides,
        } as NeoObject;

        return {
            neo_reference_id: referenceId,
            name: payload.name,
            is_potentially_hazardous_asteroid: payload.is_potentially_hazardous_asteroid,
            is_sentry_object: payload.is_sentry_object,
            absolute_magnitude_h: payload.absolute_magnitude_h,
            payload,
        };
    }

    describe("upsertObjects", () => {
        it("atualiza o objeto existente em vez de duplicar", async () => {
            await repository.upsertObjects([neoObject("3542519")]);
            await repository.upsertObjects([
                { ...neoObject("3542519"), name: "(nome revisado)", is_potentially_hazardous_asteroid: true },
            ]);

            const stored = await repository.findObjectByReferenceId("3542519");

            expect(stored?.name).toBe("(nome revisado)");
            expect(stored?.is_potentially_hazardous_asteroid).toBe(true);
        });

        it("preserva o payload jsonb com tipos intactos no round-trip", async () => {
            await repository.upsertObjects([neoObject("3542519")]);

            const stored = await repository.findObjectByReferenceId("3542519");

            expect(stored?.payload.close_approach_data[0].orbiting_body).toBe("Earth");
            expect(typeof stored?.payload.absolute_magnitude_h).toBe("number");
        });

        it("findObjectsByReferenceIds não consulta o banco com lista vazia", async () => {
            await expect(repository.findObjectsByReferenceIds([])).resolves.toEqual([]);
        });

        it("findObjectsByReferenceIds ignora ids inexistentes", async () => {
            await repository.upsertObjects([neoObject("1"), neoObject("2")]);

            const result = await repository.findObjectsByReferenceIds(["1", "2", "999"]);

            expect(result.map((entry) => entry.neo_reference_id).sort()).toEqual(["1", "2"]);
        });
    });

    describe("dias do feed", () => {
        it("upsertFeedDays atualiza a lista de ids do dia", async () => {
            await repository.upsertFeedDays([{ date: "2024-05-01", neo_reference_ids: ["1"], element_count: 1 }]);
            await repository.upsertFeedDays([{ date: "2024-05-01", neo_reference_ids: ["1", "2"], element_count: 2 }]);

            const days = await repository.findFeedDays("2024-05-01", "2024-05-01");

            expect(days).toHaveLength(1);
            expect(days[0].neo_reference_ids).toEqual(["1", "2"]);
            expect(days[0].element_count).toBe(2);
        });

        it("distingue dia sem aproximações de dia nunca consultado", async () => {
            await repository.upsertFeedDays([{ date: "2024-05-01", neo_reference_ids: [], element_count: 0 }]);

            const days = await repository.findFeedDays("2024-05-01", "2024-05-02");

            expect(days.map((day) => day.date)).toEqual(["2024-05-01"]);
            expect(days[0].neo_reference_ids).toEqual([]);
        });

        it("findFeedDays ordena crescente e respeita as duas pontas", async () => {
            await repository.upsertFeedDays([
                { date: "2024-05-03", neo_reference_ids: [], element_count: 0 },
                { date: "2024-05-01", neo_reference_ids: [], element_count: 0 },
                { date: "2024-05-09", neo_reference_ids: [], element_count: 0 },
            ]);

            const days = await repository.findFeedDays("2024-05-01", "2024-05-03");

            expect(days.map((day) => day.date)).toEqual(["2024-05-01", "2024-05-03"]);
        });

        it("upsertFeedDays não vai ao banco com lista vazia", async () => {
            await expect(repository.upsertFeedDays([])).resolves.toBeUndefined();
        });
    });
});
