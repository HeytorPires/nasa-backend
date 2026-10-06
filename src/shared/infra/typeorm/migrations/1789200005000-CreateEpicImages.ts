import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { baseColumns } from "./helpers/base-columns";

export class CreateEpicImages1789200005000 implements MigrationInterface {
    name = "CreateEpicImages1789200005000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "epic_images",
                columns: [
                    ...baseColumns(),
                    { name: "identifier", type: "character varying", length: "32" },
                    { name: "collection", type: "character varying", length: "16" },
                    { name: "captured_on", type: "date" },
                    { name: "captured_at", type: "timestamp with time zone" },
                    { name: "image", type: "character varying", length: "128" },
                    { name: "archive_url", type: "text" },
                    { name: "payload", type: "jsonb" },
                ],
            }),
            true,
        );

        await queryRunner.createIndices("epic_images", [
            new TableIndex({
                name: "uq_epic_images_collection_identifier",
                columnNames: ["collection", "identifier"],
                isUnique: true,
            }),
            new TableIndex({ name: "idx_epic_images_captured_on", columnNames: ["captured_on"] }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("epic_images", true);
    }
}
