import { createTestApp, TestApp } from "tests/support/test-app";

const WORDPRESS_PAYLOAD = {
    date: "2024-05-01",
    post_id: 1,
    title: "IC 1795",
    permalink: "https://science.nasa.gov/artigo",
    media_type: "image",
    explanation: "<strong>Explanation:&nbsp;</strong>Nebulosa.",
    credit: "Fotógrafo",
    alt: "Nebulosa vermelha",
    url: "https://science.nasa.gov/artigo",
    hdurl: "https://assets.science.nasa.gov/ic1795.jpg",
};

describe("APOD (e2e)", () => {
    let context: TestApp;

    beforeAll(async () => {
        context = await createTestApp();
    });

    afterAll(async () => {
        await context.close();
    });

    beforeEach(async () => {
        await context.reset(["apods"]);
    });

    describe("GET /v1/apods/:date", () => {
        it("busca no upstream, mapeia o payload e persiste no Postgres", async () => {
            context.upstream.on("/apod-basic/240501", WORDPRESS_PAYLOAD);

            const response = await context.http().get("/v1/apods/2024-05-01").expect(200);

            expect(response.body).toMatchObject({
                date: "2024-05-01",
                title: "IC 1795",
                url: "https://assets.science.nasa.gov/ic1795.jpg",
                explanation: "Explanation: Nebulosa.",
                copyright: "Fotógrafo",
            });

            const rows = await context.dataSource.query<{ title: string }[]>(
                `SELECT title FROM apods WHERE date = '2024-05-01'`,
            );
            expect(rows).toHaveLength(1);
        });

        it("na segunda chamada serve do cache, sem tocar no upstream", async () => {
            context.upstream.on("/apod-basic/240501", WORDPRESS_PAYLOAD);

            await context.http().get("/v1/apods/2024-05-01").expect(200);
            await context.http().get("/v1/apods/2024-05-01").expect(200);

            expect(context.upstream.callsMatching("/apod-basic/240501")).toHaveLength(1);
        });

        it("com o cache limpo, responde do banco sem tocar no upstream", async () => {
            context.upstream.on("/apod-basic/240501", WORDPRESS_PAYLOAD);
            await context.http().get("/v1/apods/2024-05-01").expect(200);

            context.cache.clear();
            const response = await context.http().get("/v1/apods/2024-05-01").expect(200);

            expect(response.body).toMatchObject({ title: "IC 1795" });
            expect(context.upstream.callsMatching("/apod-basic/240501")).toHaveLength(1);
        });

        it("devolve 404 quando não há APOD publicado na data", async () => {
            await context.http().get("/v1/apods/1990-01-01").expect(404);
        });

        it("devolve 422 para data malformada", async () => {
            await context.http().get("/v1/apods/nao-e-data").expect(422);
        });
    });

    describe("GET /v1/apods/range", () => {
        it("busca dia a dia e persiste só as datas publicadas", async () => {
            context.upstream
                .on("/apod-basic/240501", WORDPRESS_PAYLOAD)
                .on("/apod-basic/240503", { ...WORDPRESS_PAYLOAD, date: "2024-05-03", title: "Outro" });

            const response = await context
                .http()
                .get("/v1/apods/range?startDate=2024-05-01&endDate=2024-05-03")
                .expect(200);

            expect((response.body as { date: string }[]).map((apod) => apod.date)).toEqual([
                "2024-05-01",
                "2024-05-03",
            ]);

            const rows = await context.dataSource.query<unknown[]>(`SELECT id FROM apods`);
            expect(rows).toHaveLength(2);
        });

        it("devolve 422 quando o intervalo passa de 30 dias", async () => {
            await context.http().get("/v1/apods/range?startDate=2024-05-01&endDate=2024-09-01").expect(422);
        });

        it("devolve 422 quando a data final é anterior à inicial", async () => {
            await context.http().get("/v1/apods/range?startDate=2024-05-10&endDate=2024-05-01").expect(422);
        });

        it("rejeita propriedade fora do DTO", async () => {
            await context.http().get("/v1/apods/range?startDate=2024-05-01&endDate=2024-05-03&extra=1").expect(422);
        });
    });

    describe("GET /v1/apods/random", () => {
        it("devolve 422 acima do teto de 25 imposto pela API WordPress", async () => {
            await context.http().get("/v1/apods/random?quantity=100").expect(422);
        });

        it("devolve 422 para quantidade não numérica", async () => {
            await context.http().get("/v1/apods/random?quantity=muitas").expect(422);
        });
    });
});
