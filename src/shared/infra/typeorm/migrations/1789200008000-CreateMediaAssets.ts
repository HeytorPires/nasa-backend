import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { baseColumns } from "./helpers/base-columns";

export class CreateMediaAssets1789200008000 implements MigrationInterface {
    name = "CreateMediaAssets1789200008000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "media_assets",
                columns: [
                    ...baseColumns(),
                    { name: "nasa_id", type: "character varying", length: "255" },
                    { name: "title", type: "character varying", length: "1024" },
                    { name: "media_type", type: "character varying", length: "32" },
                    { name: "date_created", type: "timestamp with time zone", isNullable: true },
                    { name: "center", type: "character varying", length: "128", isNullable: true },
                    { name: "keywords", type: "text", isArray: true, default: "'{}'" },
                    { name: "payload", type: "jsonb" },
                ],
            }),
            true,
        );

        await queryRunner.createIndices("media_assets", [
            new TableIndex({ name: "uq_media_assets_nasa_id", columnNames: ["nasa_id"], isUnique: true }),
            new TableIndex({ name: "idx_media_assets_media_type", columnNames: ["media_type"] }),
            new TableIndex({ name: "idx_media_assets_date_created", columnNames: ["date_created"] }),
        ]);

        await queryRunner.query(`CREATE INDEX "idx_media_assets_keywords" ON "media_assets" USING GIN ("keywords")`);
        await queryRunner.query(
            `CREATE INDEX "idx_media_assets_payload" ON "media_assets" USING GIN ("payload" jsonb_path_ops)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("media_assets", true);
    }
}
