import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { baseColumns } from "./helpers/base-columns";

export class CreateMarsWeatherSols1789200007000 implements MigrationInterface {
    name = "CreateMarsWeatherSols1789200007000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "mars_weather_sols",
                columns: [
                    ...baseColumns(),
                    { name: "sol", type: "integer" },
                    { name: "first_utc", type: "timestamp with time zone", isNullable: true },
                    { name: "last_utc", type: "timestamp with time zone", isNullable: true },
                    { name: "season", type: "character varying", length: "32", isNullable: true },
                    { name: "average_temperature", type: "double precision", isNullable: true },
                    { name: "payload", type: "jsonb" },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            "mars_weather_sols",
            new TableIndex({ name: "uq_mars_weather_sols_sol", columnNames: ["sol"], isUnique: true }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("mars_weather_sols", true);
    }
}
