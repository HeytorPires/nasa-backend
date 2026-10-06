import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { baseColumns } from "./helpers/base-columns";

export class CreateTechTransferItems1789200009000 implements MigrationInterface {
    name = "CreateTechTransferItems1789200009000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "tech_transfer_items",
                columns: [
                    ...baseColumns(),
                    { name: "category", type: "character varying", length: "32" },
                    { name: "external_id", type: "character varying", length: "64" },
                    { name: "case_number", type: "character varying", length: "64", isNullable: true },
                    { name: "title", type: "character varying", length: "1024" },
                    { name: "description", type: "text", isNullable: true },
                    { name: "center", type: "character varying", length: "64", isNullable: true },
                    { name: "payload", type: "jsonb" },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            "tech_transfer_items",
            new TableIndex({
                name: "uq_tech_transfer_items_category_external_id",
                columnNames: ["category", "external_id"],
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("tech_transfer_items", true);
    }
}
