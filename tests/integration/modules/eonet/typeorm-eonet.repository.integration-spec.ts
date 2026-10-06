import { DataSource } from "typeorm";
import { EonetEventEntity } from "src/modules/eonet/entities/eonet-event.entity";
import { TypeOrmEonetRepository } from "src/modules/eonet/repositories/typeorm/typeorm-eonet.repository";
import { addDays } from "src/shared/utils/date.util";
import { createTestDataSource, truncate } from "tests/support/database";

describe("TypeOrmEonetRepository (integração)", () => {
    let dataSource: DataSource;
    let repository: TypeOrmEonetRepository;

    beforeAll(async () => {
        dataSource = await createTestDataSource();
        repository = new TypeOrmEonetRepository(dataSource.getRepository(EonetEventEntity));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        await truncate(dataSource, ["eonet_events"]);
    });

    function event(id: string, overrides: Partial<EonetEventEntity> = {}) {
        return {
            eonet_id: id,
            title: `Evento ${id}`,
            closed: null,
            category_ids: ["wildfires"],
            last_geometry_at: new Date("2024-05-01T00:00:00Z"),
            payload: { id, title: `Evento ${id}` },
            ...overrides,
        } as Partial<EonetEventEntity>;
    }

    it("upsertMany atualiza pelo eonet_id", async () => {
        await repository.upsertMany([event("EONET_1")]);
        await repository.upsertMany([event("EONET_1", { title: "Título revisado" })]);

        const stored = await repository.findByEonetId("EONET_1");

        expect(stored?.title).toBe("Título revisado");
    });

    it("filtra por categoria usando o operador de array coberto pelo índice GIN", async () => {
        await repository.upsertMany([
            event("EONET_1", { category_ids: ["wildfires"] }),
            event("EONET_2", { category_ids: ["severeStorms", "wildfires"] }),
            event("EONET_3", { category_ids: ["volcanoes"] }),
        ]);

        const result = await repository.findEvents({ category: "wildfires" });

        expect(result.map((entry) => entry.eonet_id).sort()).toEqual(["EONET_1", "EONET_2"]);
    });

    it("separa eventos abertos de encerrados pelo campo closed", async () => {
        await repository.upsertMany([
            event("EONET_ABERTO", { closed: null }),
            event("EONET_FECHADO", { closed: new Date("2024-06-01T00:00:00Z") }),
        ]);

        await expect(repository.findEvents({ status: "open" })).resolves.toHaveLength(1);
        await expect(repository.findEvents({ status: "closed" })).resolves.toHaveLength(1);
        await expect(repository.findEvents({ status: "all" })).resolves.toHaveLength(2);
    });

    it("a janela `days` corta pela observação mais recente", async () => {
        await repository.upsertMany([
            event("EONET_RECENTE", { last_geometry_at: addDays(new Date(), -2) }),
            event("EONET_ANTIGO", { last_geometry_at: addDays(new Date(), -90) }),
        ]);

        const result = await repository.findEvents({ days: 7 });

        expect(result.map((entry) => entry.eonet_id)).toEqual(["EONET_RECENTE"]);
    });

    it("ordena do mais recente para o mais antigo, com os sem data no fim", async () => {
        await repository.upsertMany([
            event("EONET_ANTIGO", { last_geometry_at: new Date("2024-01-01T00:00:00Z") }),
            event("EONET_NOVO", { last_geometry_at: new Date("2024-08-01T00:00:00Z") }),
            event("EONET_SEM_DATA", { last_geometry_at: null }),
        ]);

        const result = await repository.findEvents({});

        expect(result.map((entry) => entry.eonet_id)).toEqual(["EONET_NOVO", "EONET_ANTIGO", "EONET_SEM_DATA"]);
    });

    it("respeita o limit", async () => {
        await repository.upsertMany([event("EONET_1"), event("EONET_2"), event("EONET_3")]);

        await expect(repository.findEvents({ limit: 2 })).resolves.toHaveLength(2);
    });
});
