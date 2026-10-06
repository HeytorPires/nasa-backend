import { DataSource } from "typeorm";
import { typeOrmConfig } from "../../src/config/typeorm.config";

export const TEST_DATABASE_NAME = process.env.TEST_DB_NAME ?? `${process.env.DB_NAME ?? "nasa"}_test`;

export const testDataSourceOptions: typeof typeOrmConfig = {
    ...typeOrmConfig,
    database: TEST_DATABASE_NAME,
    migrations: ["src/shared/infra/typeorm/migrations/*.ts"],
    migrationsRun: false,
    synchronize: false,
    logging: false,
};

function adminDataSource(): DataSource {
    return new DataSource({ ...typeOrmConfig, database: "postgres", entities: [], migrations: [], logging: false });
}

export async function ensureTestDatabase(): Promise<void> {
    const admin = adminDataSource();
    await admin.initialize();

    try {
        const rows = await admin.query<{ datname: string }[]>(`SELECT datname FROM pg_database WHERE datname = $1`, [
            TEST_DATABASE_NAME,
        ]);

        if (rows.length === 0) {
            await admin.query(`CREATE DATABASE "${TEST_DATABASE_NAME}"`);
        }
    } finally {
        await admin.destroy();
    }
}

export async function createTestDataSource(): Promise<DataSource> {
    const dataSource = new DataSource(testDataSourceOptions);
    await dataSource.initialize();
    await dataSource.runMigrations();

    return dataSource;
}

export async function truncate(dataSource: DataSource, tables: string[]): Promise<void> {
    if (tables.length === 0) {
        return;
    }

    const quoted = tables.map((table) => `"${table}"`).join(", ");
    await dataSource.query(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
}
