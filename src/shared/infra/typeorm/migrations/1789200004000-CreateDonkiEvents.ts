import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { baseColumns } from "./helpers/base-columns";

export class CreateDonkiEvents1789200004000 implements MigrationInterface {
    name = "CreateDonkiEvents1789200004000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "donki_events",
                columns: [
                    ...baseColumns(),
                    { name: "event_type", type: "character varying", length: "32" },
                    { name: "activity_id", type: "character varying", length: "128" },
                    { name: "event_time", type: "timestamp with time zone", isNullable: true },
                    { name: "payload", type: "jsonb" },
                ],
            }),
            true,
        );

        await queryRunner.createIndices("donki_events", [
            new TableIndex({
                name: "uq_donki_events_type_activity",
                columnNames: ["event_type", "activity_id"],
                isUnique: true,
            }),
            new TableIndex({ name: "idx_donki_events_event_time", columnNames: ["event_time"] }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("donki_events", true);
    }
}
