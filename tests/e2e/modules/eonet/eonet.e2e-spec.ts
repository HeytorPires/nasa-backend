import { createTestApp, TestApp } from "tests/support/test-app";

const EVENT = {
    id: "EONET_E2E",
    title: "Incêndio de teste",
    description: null,
    link: "https://eonet.gsfc.nasa.gov/api/v3/events/EONET_E2E",
    closed: null,
    categories: [{ id: "wildfires", title: "Wildfires" }],
    sources: [],
    geometry: [
        { date: "2024-05-01T00:00:00Z", type: "Point", coordinates: [0, 0] },
        { date: "2024-05-03T00:00:00Z", type: "Point", coordinates: [1, 1] },
    ],
};

describe("EONET (e2e)", () => {
    let context: TestApp;

    beforeAll(async () => {
        context = await createTestApp();
    });

    afterAll(async () => {
        await context.close();
    });

    beforeEach(async () => {
        await context.reset(["eonet_events"]);
    });

    describe("GET /v1/eonet/events", () => {
        it("persiste o evento com categorias e data da última observação", async () => {
            context.upstream.on("/events", { title: "", description: "", link: "", events: [EVENT] });

            const response = await context.http().get("/v1/eonet/events?status=open&limit=1").expect(200);

            expect((response.body as { id: string }[])[0]).toMatchObject({ id: "EONET_E2E" });

            const rows = await context.dataSource.query<{ category_ids: string[]; last_geometry_at: Date }[]>(
                `SELECT category_ids, last_geometry_at FROM eonet_events WHERE eonet_id = 'EONET_E2E'`,
            );
            expect(rows[0].category_ids).toEqual(["wildfires"]);
            expect(new Date(rows[0].last_geometry_at).toISOString()).toBe("2024-05-03T00:00:00.000Z");
        });

        it("responde do banco na chamada seguinte", async () => {
            context.upstream.on("/events", { title: "", description: "", link: "", events: [EVENT] });

            await context.http().get("/v1/eonet/events?status=open").expect(200);
            context.cache.clear();
            await context.http().get("/v1/eonet/events?status=open").expect(200);

            expect(context.upstream.callsMatching("/events")).toHaveLength(1);
        });

        it("devolve 422 para status fora do enum", async () => {
            await context.http().get("/v1/eonet/events?status=talvez").expect(422);
        });

        it("devolve 422 para categoria com caracteres inesperados", async () => {
            await context.http().get("/v1/eonet/events?category=wild;fires").expect(422);
        });

        it("devolve 422 para janela de dias fora do intervalo aceito", async () => {
            await context.http().get("/v1/eonet/events?days=0").expect(422);
        });
    });

    describe("catálogos", () => {
        it("lista categorias, fontes e camadas", async () => {
            context.upstream
                .on("/categories", { title: "", description: "", link: "", categories: [{ id: "drought" }] })
                .on("/sources", { title: "", description: "", link: "", sources: [{ id: "JTWC" }] })
                .on("/layers", { categories: [] });

            await context.http().get("/v1/eonet/categories").expect(200);
            await context.http().get("/v1/eonet/sources").expect(200);
            await context.http().get("/v1/eonet/layers").expect(200);
        });

        it("camadas por categoria usam outra rota do upstream", async () => {
            context.upstream.on("/layers/wildfires", { categories: [] });

            await context.http().get("/v1/eonet/layers/wildfires").expect(200);

            expect(context.upstream.callsMatching("/layers/wildfires")).toHaveLength(1);
        });
    });
});
