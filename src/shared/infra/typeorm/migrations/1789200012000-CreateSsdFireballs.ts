import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { baseColumns } from "./helpers/base-columns";

export class CreateSsdFireballs1789200012000 implements MigrationInterface {
    name = "CreateSsdFireballs1789200012000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "ssd_fireballs",
                columns: [
                    ...baseColumns(),
                    { name: "observed_at", type: "timestamp with time zone" },
                    { name: "latitude", type: "double precision", isNullable: true },
                    { name: "longitude", type: "double precision", isNullable: true },
                    { name: "impact_energy", type: "double precision", isNullable: true },
                    { name: "payload", type: "jsonb" },
                ],
            }),
            true,
        );

        await queryRunner.createIndices("ssd_fireballs", [
            new TableIndex({
                name: "uq_ssd_fireballs_observed_at_lat_lon",
                columnNames: ["observed_at", "latitude", "longitude"],
                isUnique: true,
            }),
            new TableIndex({ name: "idx_ssd_fireballs_observed_at", columnNames: ["observed_at"] }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("ssd_fireballs", true);
    }
}
