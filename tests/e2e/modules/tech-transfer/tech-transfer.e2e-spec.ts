import { createTestApp, TestApp } from "tests/support/test-app";

const ROW = [
    "64e71c1a64038afc1d0a01d2",
    "LEW-TOPS-168",
    'Next Generation <span class="highlight">Engine</span>',
    "Gerador leve.",
    "LEW-TOPS-168",
    "Power Generation and Storage",
    "",
    "",
    "",
    "GRC",
    "https://technology.nasa.gov/img.jpg",
    "",
    16.07,
];

describe("TechTransfer (e2e)", () => {
    let context: TestApp;

    beforeAll(async () => {
        context = await createTestApp();
    });

    afterAll(async () => {
        await context.close();
    });

    beforeEach(async () => {
        await context.reset(["tech_transfer_items"]);
    });

    it("normaliza os arrays posicionais e persiste com a categoria consultada", async () => {
        context.upstream.on("/patent/engine", { results: [ROW], count: 1, total: 1, page: 1, perpage: 10 });

        const response = await context.http().get("/v1/tech-transfer/patents?q=engine").expect(200);

        expect((response.body as { results: { title: string }[] }).results[0].title).toBe("Next Generation Engine");

        const rows = await context.dataSource.query<{ category: string; center: string }[]>(
            `SELECT category, center FROM tech_transfer_items`,
        );
        expect(rows[0]).toMatchObject({ category: "patent", center: "GRC" });
    });

    it("cada categoria tem sua rota e sua entrada no banco", async () => {
        const routes = [
            ["patents", "/patent/engine", "patent"],
            ["patents-issued", "/patent_issued/engine", "patent_issued"],
            ["software", "/software/engine", "software"],
            ["spinoffs", "/spinoff/engine", "spinoff"],
        ] as const;

        for (const [, upstreamPath] of routes) {
            context.upstream.on(upstreamPath, { results: [ROW], count: 1, total: 1, page: 1, perpage: 10 });
        }

        for (const [route] of routes) {
            await context.http().get(`/v1/tech-transfer/${route}?q=engine`).expect(200);
        }

        const rows = await context.dataSource.query<{ category: string }[]>(
            `SELECT category FROM tech_transfer_items ORDER BY category`,
        );
        expect(rows.map((row) => row.category)).toEqual(["patent", "patent_issued", "software", "spinoff"]);
    });

    it("devolve 422 sem o termo de busca", async () => {
        await context.http().get("/v1/tech-transfer/patents").expect(422);
    });

    it("devolve 422 para termo curto demais", async () => {
        await context.http().get("/v1/tech-transfer/patents?q=a").expect(422);
    });
});
