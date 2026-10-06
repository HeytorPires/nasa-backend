import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { baseColumns } from "./helpers/base-columns";

export class CreateTleRecords1789200010000 implements MigrationInterface {
    name = "CreateTleRecords1789200010000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "tle_records",
                columns: [
                    ...baseColumns(),
                    { name: "satellite_id", type: "integer" },
                    { name: "name", type: "character varying", length: "255" },
                    { name: "epoch", type: "timestamp with time zone" },
                    { name: "line1", type: "character varying", length: "128" },
                    { name: "line2", type: "character varying", length: "128" },
                ],
            }),
            true,
        );

        await queryRunner.createIndices("tle_records", [
            new TableIndex({
                name: "uq_tle_records_satellite_epoch",
                columnNames: ["satellite_id", "epoch"],
                isUnique: true,
            }),
            new TableIndex({ name: "idx_tle_records_satellite_id", columnNames: ["satellite_id"] }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("tle_records", true);
    }
}
