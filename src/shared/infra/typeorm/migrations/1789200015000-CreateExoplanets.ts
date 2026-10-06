import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { baseColumns } from "./helpers/base-columns";

export class CreateExoplanets1789200015000 implements MigrationInterface {
    name = "CreateExoplanets1789200015000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "exoplanets",
                columns: [
                    ...baseColumns(),
                    { name: "pl_name", type: "character varying", length: "128" },
                    { name: "hostname", type: "character varying", length: "128", isNullable: true },
                    { name: "disc_year", type: "integer", isNullable: true },
                    { name: "discoverymethod", type: "character varying", length: "64", isNullable: true },
                    { name: "payload", type: "jsonb" },
                ],
            }),
            true,
        );

        await queryRunner.createIndices("exoplanets", [
            new TableIndex({ name: "uq_exoplanets_pl_name", columnNames: ["pl_name"], isUnique: true }),
            new TableIndex({ name: "idx_exoplanets_hostname", columnNames: ["hostname"] }),
            new TableIndex({ name: "idx_exoplanets_disc_year", columnNames: ["disc_year"] }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("exoplanets", true);
    }
}
