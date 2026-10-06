import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { baseColumns } from "./helpers/base-columns";

export class CreateEonetEvents1789200006000 implements MigrationInterface {
    name = "CreateEonetEvents1789200006000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "eonet_events",
                columns: [
                    ...baseColumns(),
                    { name: "eonet_id", type: "character varying", length: "64" },
                    { name: "title", type: "character varying", length: "512" },
                    { name: "closed", type: "timestamp with time zone", isNullable: true },
                    { name: "category_ids", type: "text", isArray: true, default: "'{}'" },
                    { name: "last_geometry_at", type: "timestamp with time zone", isNullable: true },
                    { name: "payload", type: "jsonb" },
                ],
            }),
            true,
        );

        await queryRunner.createIndices("eonet_events", [
            new TableIndex({
                name: "uq_eonet_events_eonet_id",
                columnNames: ["eonet_id"],
                isUnique: true,
            }),
            new TableIndex({ name: "idx_eonet_events_closed", columnNames: ["closed"] }),
            new TableIndex({
                name: "idx_eonet_events_last_geometry_at",
                columnNames: ["last_geometry_at"],
            }),
        ]);

        await queryRunner.query(
            `CREATE INDEX "idx_eonet_events_categories" ON "eonet_events" USING GIN ("category_ids")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("eonet_events", true);
    }
}
