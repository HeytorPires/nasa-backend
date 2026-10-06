import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { baseColumns } from "./helpers/base-columns";

export class CreateNeoFeedDays1789200003000 implements MigrationInterface {
    name = "CreateNeoFeedDays1789200003000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "neo_feed_days",
                columns: [
                    ...baseColumns(),
                    { name: "date", type: "date" },
                    { name: "neo_reference_ids", type: "text", isArray: true, default: "'{}'" },
                    { name: "element_count", type: "integer", default: 0 },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            "neo_feed_days",
            new TableIndex({ name: "uq_neo_feed_days_date", columnNames: ["date"], isUnique: true }),
        );

        await queryRunner.query(
            `CREATE INDEX "idx_neo_feed_days_reference_ids" ON "neo_feed_days" USING GIN ("neo_reference_ids")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("neo_feed_days", true);
    }
}
