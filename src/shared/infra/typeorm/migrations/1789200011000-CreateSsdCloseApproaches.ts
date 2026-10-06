import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { baseColumns } from "./helpers/base-columns";

export class CreateSsdCloseApproaches1789200011000 implements MigrationInterface {
    name = "CreateSsdCloseApproaches1789200011000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "ssd_close_approaches",
                columns: [
                    ...baseColumns(),
                    { name: "designation", type: "character varying", length: "64" },
                    { name: "close_approach_at", type: "timestamp with time zone" },
                    { name: "distance_au", type: "double precision", isNullable: true },
                    { name: "relative_velocity_kms", type: "double precision", isNullable: true },
                    { name: "payload", type: "jsonb" },
                ],
            }),
            true,
        );

        await queryRunner.createIndices("ssd_close_approaches", [
            new TableIndex({
                name: "uq_ssd_close_approaches_des_cd",
                columnNames: ["designation", "close_approach_at"],
                isUnique: true,
            }),
            new TableIndex({
                name: "idx_ssd_close_approaches_at",
                columnNames: ["close_approach_at"],
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("ssd_close_approaches", true);
    }
}
