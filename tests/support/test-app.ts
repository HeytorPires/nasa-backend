import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { DataSource } from "typeorm";
import { AppModule } from "../../src/app.module";
import { appConfig } from "../../src/config/app.config";
import { CACHE_PROVIDER, HTTP_CLIENT_PROVIDER } from "../../src/shared/tokens";
import { InMemoryCache } from "./in-memory-cache";
import { testDataSourceOptions, truncate } from "./database";
import { UpstreamStub } from "./upstream-stub";

export interface TestApp {
    app: INestApplication;
    upstream: UpstreamStub;
    cache: InMemoryCache;
    dataSource: DataSource;
    http: () => request.Agent;
    reset: (tables: string[]) => Promise<void>;
    close: () => Promise<void>;
}

export async function createTestApp(): Promise<TestApp> {
    const upstream = new UpstreamStub();
    const cache = new InMemoryCache();

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
        .overrideProvider(HTTP_CLIENT_PROVIDER)
        .useValue(upstream)
        .overrideProvider(CACHE_PROVIDER)
        .useValue(cache)
        .overrideProvider(DataSource)
        .useFactory({ factory: () => new DataSource(testDataSourceOptions).initialize() })
        .compile();

    const app = moduleRef.createNestApplication();
    appConfig(app);
    await app.init();

    const dataSource = app.get(DataSource);

    return {
        app,
        upstream,
        cache,
        dataSource,
        http: () => request(app.getHttpServer() as Parameters<typeof request>[0]),
        reset: async (tables: string[]) => {
            cache.clear();
            upstream.reset();
            await truncate(dataSource, tables);
        },
        close: async () => {
            await app.close();
        },
    };
}
