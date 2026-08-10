import "dotenv/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { ApodEntity } from "../modules/apod/entities/apod.entity";

export const typeOrmConfig: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [ApodEntity],
    migrations: ["dist/shared/infra/typeorm/migrations/*.js"],
};

export default new DataSource({
    ...typeOrmConfig,
    migrations: ["src/shared/infra/typeorm/migrations/*.ts"],
});
