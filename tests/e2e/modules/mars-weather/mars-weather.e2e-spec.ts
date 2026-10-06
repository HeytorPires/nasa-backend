import { createTestApp, TestApp } from "tests/support/test-app";

const INSIGHT_RESPONSE = {
    "675": {
        AT: { av: -62.3, ct: 1, mn: -96, mx: -15 },
        First_UTC: "2020-10-19T18:32:20Z",
        Last_UTC: "2020-10-20T19:11:55Z",
        Season: "fall",
    },
    "676": {
        AT: { av: -60.1, ct: 1, mn: -95, mx: -14 },
        First_UTC: "2020-10-20T19:11:55Z",
        Last_UTC: "2020-10-21T19:51:30Z",
        Season: "fall",
    },
    sol_keys: ["675", "676"],
    validity_checks: {},
};

describe("Mars Weather (e2e)", () => {
    let context: TestApp;

    beforeAll(async () => {
        context = await createTestApp();
    });

    afterAll(async () => {
        await context.close();
    });

    beforeEach(async () => {
        await context.reset(["mars_weather_sols"]);
    });

    it("achata os sols, ordena do mais recente e persiste", async () => {
        context.upstream.on("/insight_weather/", INSIGHT_RESPONSE);

        const response = await context.http().get("/v1/mars-weather").expect(200);

        expect((response.body as { sol: number }[]).map((entry) => entry.sol)).toEqual([676, 675]);

        const rows = await context.dataSource.query<{ sol: number; average_temperature: number }[]>(
            `SELECT sol, average_temperature FROM mars_weather_sols ORDER BY sol`,
        );
        expect(rows).toHaveLength(2);
        expect(Number(rows[0].average_temperature)).toBeCloseTo(-62.3);
    });

    it("busca um sol específico do histórico, sem tocar no upstream", async () => {
        context.upstream.on("/insight_weather/", INSIGHT_RESPONSE);
        await context.http().get("/v1/mars-weather").expect(200);

        const callsBefore = context.upstream.callsMatching("/insight_weather/").length;
        const response = await context.http().get("/v1/mars-weather/675").expect(200);

        expect(response.body).toMatchObject({ sol: 675, Season: "fall" });
        expect(context.upstream.callsMatching("/insight_weather/")).toHaveLength(callsBefore);
    });

    it("devolve 404 para um sol que não existe em lugar nenhum", async () => {
        context.upstream.on("/insight_weather/", INSIGHT_RESPONSE);

        await context.http().get("/v1/mars-weather/1").expect(404);
    });

    it("devolve 422 para sol não numérico", async () => {
        await context.http().get("/v1/mars-weather/ontem").expect(422);
    });

    it("cai para o histórico do banco quando o InSight está sem downlink", async () => {
        context.upstream.on("/insight_weather/", INSIGHT_RESPONSE);
        await context.http().get("/v1/mars-weather").expect(200);

        context.cache.clear();
        context.upstream.reset();
        context.upstream.on("/insight_weather/", { sol_keys: [], validity_checks: {} });

        const response = await context.http().get("/v1/mars-weather").expect(200);

        expect((response.body as { sol: number }[]).map((entry) => entry.sol)).toEqual([676, 675]);
    });
});
