import { createTestApp, TestApp } from "tests/support/test-app";

describe("SSD/CNEOS (e2e)", () => {
    let context: TestApp;

    beforeAll(async () => {
        context = await createTestApp();
    });

    afterAll(async () => {
        await context.close();
    });

    beforeEach(async () => {
        await context.reset(["ssd_close_approaches", "ssd_fireballs", "ssd_sentry_objects"]);
    });

    it("converte a tabela fields/data das aproximações em linhas persistidas", async () => {
        context.upstream.on("/cad.api", {
            count: 1,
            fields: ["des", "cd", "dist", "v_rel"],
            data: [["2024 AV2", "2024-Jan-01 02:47", "0.0097", "8.06"]],
        });

        await context.http().get("/v1/ssd/close-approaches?dateMin=2024-01-01&dateMax=2024-01-31").expect(200);

        const rows = await context.dataSource.query<{ designation: string; close_approach_at: Date }[]>(
            `SELECT designation, close_approach_at FROM ssd_close_approaches`,
        );
        expect(rows[0].designation).toBe("2024 AV2");
        expect(new Date(rows[0].close_approach_at).toISOString()).toBe("2024-01-01T02:47:00.000Z");
    });

    it("aplica o sinal do hemisfério às coordenadas do fireball", async () => {
        context.upstream.on("/fireball.api", {
            count: 1,
            fields: ["date", "lat", "lat-dir", "lon", "lon-dir", "impact-e"],
            data: [["2026-09-10 05:22:22", "19.3", "S", "28.1", "W", "0.33"]],
        });

        await context.http().get("/v1/ssd/fireballs?limit=3").expect(200);

        const rows = await context.dataSource.query<{ latitude: number; longitude: number }[]>(
            `SELECT latitude, longitude FROM ssd_fireballs`,
        );
        expect(Number(rows[0].latitude)).toBeCloseTo(-19.3);
        expect(Number(rows[0].longitude)).toBeCloseTo(-28.1);
    });

    it("persiste os objetos do Sentry, que já vêm nomeados", async () => {
        context.upstream.on("/sentry.api", {
            count: 1,
            data: [{ des: "1979 XB", fullname: "(1979 XB)", ip: "8.5e-07", ps_cum: "-2.69" }],
        });

        await context.http().get("/v1/ssd/sentry").expect(200);

        await expect(context.dataSource.query<unknown[]>(`SELECT id FROM ssd_sentry_objects`)).resolves.toHaveLength(1);
    });

    it("scout e mission-design ficam só em cache, sem persistir", async () => {
        context.upstream.on("/scout.api", { count: 0, data: [] }).on("/mdesign.api", { count: 0 });

        await context.http().get("/v1/ssd/scout").expect(200);
        await context.http().get("/v1/ssd/mission-design?des=2010%20TK7").expect(200);

        await expect(context.dataSource.query<unknown[]>(`SELECT id FROM ssd_close_approaches`)).resolves.toHaveLength(
            0,
        );
    });

    it("devolve 422 para distância máxima não numérica", async () => {
        await context.http().get("/v1/ssd/close-approaches?distMax=perto").expect(422);
    });

    it("devolve 422 para designação com caracteres inesperados", async () => {
        await context.http().get("/v1/ssd/sentry?des=1979%20XB%3B%20drop").expect(422);
    });

    it("devolve 422 quando a data final é anterior à inicial", async () => {
        await context.http().get("/v1/ssd/fireballs?dateMin=2024-05-10&dateMax=2024-05-01").expect(422);
    });
});
