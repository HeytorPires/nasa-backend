import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { baseColumns } from "./helpers/base-columns";

export class CreateSsdSentryObjects1789200013000 implements MigrationInterface {
    name = "CreateSsdSentryObjects1789200013000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "ssd_sentry_objects",
                columns: [
                    ...baseColumns(),
                    { name: "designation", type: "character varying", length: "64" },
                    { name: "fullname", type: "character varying", length: "255", isNullable: true },
                    { name: "impact_probability", type: "double precision", isNullable: true },
                    { name: "palermo_scale_cumulative", type: "double precision", isNullable: true },
                    { name: "payload", type: "jsonb" },
                ],
            }),
            true,
        );

        await queryRunner.createIndices("ssd_sentry_objects", [
            new TableIndex({
                name: "uq_ssd_sentry_objects_designation",
                columnNames: ["designation"],
                isUnique: true,
            }),
            new TableIndex({
                name: "idx_ssd_sentry_objects_impact_probability",
                columnNames: ["impact_probability"],
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("ssd_sentry_objects", true);
    }
}
