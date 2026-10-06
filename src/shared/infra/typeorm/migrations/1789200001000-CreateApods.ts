import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { baseColumns } from "./helpers/base-columns";

export class CreateApods1789200001000 implements MigrationInterface {
    name = "CreateApods1789200001000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "apods",
                columns: [
                    ...baseColumns(),
                    { name: "date", type: "date" },
                    { name: "explanation", type: "text" },
                    { name: "media_type", type: "character varying", length: "32" },
                    { name: "service_version", type: "character varying", length: "32", isNullable: true },
                    { name: "title", type: "character varying", length: "512" },
                    { name: "url", type: "text" },
                    { name: "hdurl", type: "text", isNullable: true },
                    { name: "permalink", type: "text", isNullable: true },
                    { name: "copyright", type: "character varying", length: "512", isNullable: true },
                    { name: "alt", type: "text", isNullable: true },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            "apods",
            new TableIndex({ name: "uq_apods_date", columnNames: ["date"], isUnique: true }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("apods", true);
    }
}
