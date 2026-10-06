import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { baseColumns } from "./helpers/base-columns";

export class CreateNeoObjects1789200002000 implements MigrationInterface {
    name = "CreateNeoObjects1789200002000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "neo_objects",
                columns: [
                    ...baseColumns(),
                    { name: "neo_reference_id", type: "character varying", length: "32" },
                    { name: "name", type: "character varying", length: "255" },
                    { name: "is_potentially_hazardous_asteroid", type: "boolean", default: false },
                    { name: "is_sentry_object", type: "boolean", default: false },
                    { name: "absolute_magnitude_h", type: "double precision", isNullable: true },
                    { name: "payload", type: "jsonb" },
                ],
            }),
            true,
        );

        await queryRunner.createIndices("neo_objects", [
            new TableIndex({
                name: "uq_neo_objects_reference_id",
                columnNames: ["neo_reference_id"],
                isUnique: true,
            }),
            new TableIndex({
                name: "idx_neo_objects_hazardous",
                columnNames: ["is_potentially_hazardous_asteroid"],
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("neo_objects", true);
    }
}
