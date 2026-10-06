import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { baseColumns } from "./helpers/base-columns";

export class CreateTechportProjects1789200014000 implements MigrationInterface {
    name = "CreateTechportProjects1789200014000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "techport_projects",
                columns: [
                    ...baseColumns(),
                    { name: "project_id", type: "integer" },
                    { name: "title", type: "character varying", length: "1024", isNullable: true },
                    { name: "status", type: "character varying", length: "64", isNullable: true },
                    { name: "last_updated", type: "date", isNullable: true },
                    { name: "payload", type: "jsonb", isNullable: true },
                ],
            }),
            true,
        );

        await queryRunner.createIndices("techport_projects", [
            new TableIndex({
                name: "uq_techport_projects_project_id",
                columnNames: ["project_id"],
                isUnique: true,
            }),
            new TableIndex({
                name: "idx_techport_projects_last_updated",
                columnNames: ["last_updated"],
            }),
        ]);

        await queryRunner.query(
            `CREATE INDEX "idx_techport_projects_payload" ON "techport_projects" USING GIN ("payload" jsonb_path_ops)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("techport_projects", true);
    }
}
