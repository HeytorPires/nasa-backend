import { DataSource } from "typeorm";
import { DonkiEventEntity } from "src/modules/donki/entities/donki-event.entity";
import { TypeOrmDonkiRepository } from "src/modules/donki/repositories/typeorm/typeorm-donki.repository";
import { createTestDataSource, truncate } from "tests/support/database";

describe("TypeOrmDonkiRepository (integração)", () => {
    let dataSource: DataSource;
    let repository: TypeOrmDonkiRepository;

    beforeAll(async () => {
        dataSource = await createTestDataSource();
        repository = new TypeOrmDonkiRepository(dataSource.getRepository(DonkiEventEntity));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        await truncate(dataSource, ["donki_events"]);
    });

    function donkiEvent(eventType: string, activityId: string, eventTime: string | null) {
        return {
            event_type: eventType,
            activity_id: activityId,
            event_time: eventTime ? new Date(eventTime) : null,
            payload: { activityID: activityId },
        };
    }

    it("o mesmo activity_id em tipos diferentes convive na tabela", async () => {
        await repository.upsertMany([
            donkiEvent("cme", "ID-1", "2024-05-01T12:00:00Z"),
            donkiEvent("flr", "ID-1", "2024-05-01T12:00:00Z"),
        ]);

        const cme = await repository.findByTypeAndRange("cme", "2024-05-01", "2024-05-01");
        const flr = await repository.findByTypeAndRange("flr", "2024-05-01", "2024-05-01");

        expect(cme).toHaveLength(1);
        expect(flr).toHaveLength(1);
    });

    it("upsertMany atualiza pelo par (event_type, activity_id)", async () => {
        await repository.upsertMany([donkiEvent("cme", "ID-1", "2024-05-01T12:00:00Z")]);
        await repository.upsertMany([
            { ...donkiEvent("cme", "ID-1", "2024-05-01T12:00:00Z"), payload: { activityID: "ID-1", nota: "revisado" } },
        ]);

        const [stored] = await repository.findByTypeAndRange("cme", "2024-05-01", "2024-05-01");

        expect(stored.payload).toMatchObject({ nota: "revisado" });
    });

    it("o fim do intervalo é inclusivo mesmo para eventos no fim do dia", async () => {
        await repository.upsertMany([
            donkiEvent("cme", "MANHA", "2024-05-10T00:30:00Z"),
            donkiEvent("cme", "NOITE", "2024-05-10T23:59:00Z"),
        ]);

        const result = await repository.findByTypeAndRange("cme", "2024-05-01", "2024-05-10");

        expect(result.map((entry) => entry.activity_id).sort()).toEqual(["MANHA", "NOITE"]);
    });

    it("exclui eventos fora do intervalo e ordena crescente", async () => {
        await repository.upsertMany([
            donkiEvent("cme", "DENTRO-2", "2024-05-05T00:00:00Z"),
            donkiEvent("cme", "DENTRO-1", "2024-05-02T00:00:00Z"),
            donkiEvent("cme", "FORA", "2024-06-01T00:00:00Z"),
        ]);

        const result = await repository.findByTypeAndRange("cme", "2024-05-01", "2024-05-10");

        expect(result.map((entry) => entry.activity_id)).toEqual(["DENTRO-1", "DENTRO-2"]);
    });

    it("eventos sem instante ficam fora da consulta por intervalo", async () => {
        await repository.upsertMany([donkiEvent("cme", "SEM-DATA", null)]);

        await expect(repository.findByTypeAndRange("cme", "2024-01-01", "2030-01-01")).resolves.toEqual([]);
    });
});
