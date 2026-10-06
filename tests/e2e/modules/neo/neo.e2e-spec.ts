import { createTestApp, TestApp } from "tests/support/test-app";

const NEO_OBJECT = {
    id: "3542519",
    neo_reference_id: "3542519",
    name: "(2010 PK9)",
    nasa_jpl_url: "https://ssd.jpl.nasa.gov/",
    absolute_magnitude_h: 21.85,
    estimated_diameter: { kilometers: { estimated_diameter_min: 0.1, estimated_diameter_max: 0.2 } },
    is_potentially_hazardous_asteroid: false,
    is_sentry_object: false,
    close_approach_data: [{ close_approach_date: "2024-05-01", orbiting_body: "Earth" }],
};

describe("NeoWs (e2e)", () => {
    let context: TestApp;

    beforeAll(async () => {
        context = await createTestApp();
    });

    afterAll(async () => {
        await context.close();
    });

    beforeEach(async () => {
        await context.reset(["neo_objects", "neo_feed_days"]);
    });

    describe("GET /v1/neo/feed", () => {
        it("persiste objetos e dias do feed", async () => {
            context.upstream.on("/feed", {
                element_count: 1,
                near_earth_objects: { "2024-05-01": [NEO_OBJECT], "2024-05-02": [] },
            });

            const response = await context
                .http()
                .get("/v1/neo/feed?startDate=2024-05-01&endDate=2024-05-02")
                .expect(200);

            expect(response.body).toMatchObject({ element_count: 1 });

            const objects = await context.dataSource.query<unknown[]>(`SELECT id FROM neo_objects`);
            const days = await context.dataSource.query<unknown[]>(`SELECT id FROM neo_feed_days`);
            expect(objects).toHaveLength(1);
            expect(days).toHaveLength(2);
        });

        it("reconstrói o feed do banco na chamada seguinte, sem tocar no upstream", async () => {
            context.upstream.on("/feed", {
                element_count: 1,
                near_earth_objects: { "2024-05-01": [NEO_OBJECT], "2024-05-02": [] },
            });

            await context.http().get("/v1/neo/feed?startDate=2024-05-01&endDate=2024-05-02").expect(200);
            context.cache.clear();
            const response = await context
                .http()
                .get("/v1/neo/feed?startDate=2024-05-01&endDate=2024-05-02")
                .expect(200);

            expect(context.upstream.callsMatching("/feed")).toHaveLength(1);
            expect(response.body).toMatchObject({ element_count: 1 });
        });

        it("devolve 422 quando o intervalo passa dos 7 dias da NeoWs", async () => {
            await context.http().get("/v1/neo/feed?startDate=2024-05-01&endDate=2024-05-20").expect(422);
        });

        it("devolve 422 sem as datas obrigatórias", async () => {
            await context.http().get("/v1/neo/feed").expect(422);
        });
    });

    describe("GET /v1/neo/:asteroidId", () => {
        it("busca, persiste e depois responde do banco", async () => {
            context.upstream.on("/neo/3542519", NEO_OBJECT);

            await context.http().get("/v1/neo/3542519").expect(200);
            context.cache.clear();
            await context.http().get("/v1/neo/3542519").expect(200);

            expect(context.upstream.callsMatching("/neo/3542519")).toHaveLength(1);
        });

        it("devolve 422 para id não numérico", async () => {
            await context.http().get("/v1/neo/abc").expect(422);
        });
    });

    describe("GET /v1/neo/browse", () => {
        it("persiste os objetos da página", async () => {
            context.upstream.on("/neo/browse", {
                page: { size: 20, total_elements: 1, total_pages: 1, number: 0 },
                near_earth_objects: [NEO_OBJECT],
            });

            await context.http().get("/v1/neo/browse?page=0&size=20").expect(200);

            const rows = await context.dataSource.query<unknown[]>(`SELECT id FROM neo_objects`);
            expect(rows).toHaveLength(1);
        });

        it("devolve 422 com tamanho de página acima do máximo", async () => {
            await context.http().get("/v1/neo/browse?size=500").expect(422);
        });
    });
});
