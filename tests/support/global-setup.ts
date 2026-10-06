import "tsconfig-paths/register";
import "dotenv/config";
import { createTestDataSource, ensureTestDatabase } from "./database";

export default async function globalSetup(): Promise<void> {
    await ensureTestDatabase();

    const dataSource = await createTestDataSource();
    await dataSource.destroy();
}
