import { createTestApp, TestApp } from "tests/support/test-app";

const SEARCH_RESPONSE = {
    collection: {
        version: "1.1",
        href: "",
        metadata: { total_hits: 1 },
        items: [
            {
                href: "https://images-assets.nasa.gov/image/as11-42-6179/collection.json",
                data: [
                    {
                        nasa_id: "as11-42-6179",
                        title: "Solar Corona",
                        media_type: "image",
                        date_created: "1969-07-19T00:00:00Z",
                        center: "JSC",
                        keywords: ["Apollo", "Moon"],
                    },
                ],
                links: [{ href: "https://images-assets.nasa.gov/x~medium.jpg", rel: "preview" }],
            },
        ],
    },
};

describe("Image and Video Library (e2e)", () => {
    let context: TestApp;

    beforeAll(async () => {
        context = await createTestApp();
    });

    afterAll(async () => {
        await context.close();
    });

    beforeEach(async () => {
        await context.reset(["media_assets"]);
    });

    it("persiste os campos indexados extraídos de data[0]", async () => {
        context.upstream.on("/search", SEARCH_RESPONSE);

        await context.http().get("/v1/media/search?q=apollo%2011").expect(200);

        const rows = await context.dataSource.query<{ nasa_id: string; center: string; keywords: string[] }[]>(
            `SELECT nasa_id, center, keywords FROM media_assets`,
        );
        expect(rows[0]).toMatchObject({
            nasa_id: "as11-42-6179",
            center: "JSC",
            keywords: ["Apollo", "Moon"],
        });
    });

    it("descarta item sem nasa_id em vez de quebrar", async () => {
        context.upstream.on("/search", {
            collection: { version: "1.1", href: "", metadata: { total_hits: 1 }, items: [{ href: "x", data: [] }] },
        });

        await context.http().get("/v1/media/search?q=vazio").expect(200);

        await expect(context.dataSource.query<unknown[]>(`SELECT id FROM media_assets`)).resolves.toHaveLength(0);
    });

    it("usa cache por combinação de filtros", async () => {
        context.upstream.on("/search", SEARCH_RESPONSE);

        await context.http().get("/v1/media/search?q=moon").expect(200);
        await context.http().get("/v1/media/search?q=moon").expect(200);
        await context.http().get("/v1/media/search?q=moon&mediaType=video").expect(200);

        expect(context.upstream.callsMatching("/search")).toHaveLength(2);
    });

    it("rotas de asset, metadata e captions respondem", async () => {
        const collection = { collection: { version: "1.1", href: "", items: [{ href: "x" }] } };
        context.upstream
            .on("/asset/as11-42-6179", collection)
            .on("/metadata/as11-42-6179", collection)
            .on("/captions/as11-42-6179", collection);

        await context.http().get("/v1/media/as11-42-6179/asset").expect(200);
        await context.http().get("/v1/media/as11-42-6179/metadata").expect(200);
        await context.http().get("/v1/media/as11-42-6179/captions").expect(200);
    });

    it("devolve 422 para tipo de mídia fora do enum", async () => {
        await context.http().get("/v1/media/search?mediaType=hologram").expect(422);
    });

    it("devolve 422 para ano fora do intervalo aceito", async () => {
        await context.http().get("/v1/media/search?yearStart=1800").expect(422);
    });
});
