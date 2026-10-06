import { createTestApp, TestApp } from "tests/support/test-app";

describe("DONKI (e2e)", () => {
    let context: TestApp;

    beforeAll(async () => {
        context = await createTestApp();
    });

    afterAll(async () => {
        await context.close();
    });

    beforeEach(async () => {
        await context.reset(["donki_events"]);
    });

    it("persiste os eventos com o tipo e o id da atividade", async () => {
        context.upstream.on("/CME", [
            { activityID: "2024-05-01T12:00:00-CME-001", startTime: "2024-05-01T12:00Z", note: "x" },
        ]);

        await context.http().get("/v1/donki/cme?startDate=2024-05-01&endDate=2024-05-10").expect(200);

        const rows = await context.dataSource.query<{ event_type: string; activity_id: string }[]>(
            `SELECT event_type, activity_id FROM donki_events`,
        );
        expect(rows[0]).toMatchObject({
            event_type: "cme",
            activity_id: "2024-05-01T12:00:00-CME-001",
        });
    });

    it("extrai o instante do campo próprio de cada serviço", async () => {
        context.upstream.on("/FLR", [{ flrID: "FLR-1", beginTime: "2024-05-02T00:00Z" }]);

        await context.http().get("/v1/donki/flr?startDate=2024-05-01&endDate=2024-05-10").expect(200);

        const rows = await context.dataSource.query<{ event_time: Date }[]>(
            `SELECT event_time FROM donki_events WHERE event_type = 'flr'`,
        );
        expect(new Date(rows[0].event_time).toISOString()).toBe("2024-05-02T00:00:00.000Z");
    });

    it("responde do banco na chamada seguinte", async () => {
        context.upstream.on("/CME", [{ activityID: "ID-1", startTime: "2024-05-01T12:00Z" }]);

        await context.http().get("/v1/donki/cme?startDate=2024-05-01&endDate=2024-05-10").expect(200);
        context.cache.clear();
        await context.http().get("/v1/donki/cme?startDate=2024-05-01&endDate=2024-05-10").expect(200);

        expect(context.upstream.callsMatching("/CME")).toHaveLength(1);
    });

    it("consultas com filtro extra vão sempre ao upstream", async () => {
        context.upstream.on("/CMEAnalysis", []);

        await context
            .http()
            .get("/v1/donki/cme-analysis?startDate=2024-05-01&endDate=2024-05-10&speed=500")
            .expect(200);
        context.cache.clear();
        await context
            .http()
            .get("/v1/donki/cme-analysis?startDate=2024-05-01&endDate=2024-05-10&speed=500")
            .expect(200);

        expect(context.upstream.callsMatching("/CMEAnalysis")).toHaveLength(2);
    });

    it("cada serviço tem sua rota", async () => {
        const routes = [
            ["gst", "/GST"],
            ["ips", "/IPS"],
            ["sep", "/SEP"],
            ["mpc", "/MPC"],
            ["rbe", "/RBE"],
            ["hss", "/HSS"],
            ["wsa-enlil", "/WSAEnlilSimulations"],
            ["notifications", "/notifications"],
        ] as const;

        for (const [, upstreamPath] of routes) {
            context.upstream.on(upstreamPath, []);
        }

        for (const [route] of routes) {
            await context.http().get(`/v1/donki/${route}`).expect(200);
        }
    });

    it("devolve 422 quando o intervalo passa de 30 dias", async () => {
        await context.http().get("/v1/donki/notifications?startDate=2024-05-01&endDate=2024-09-01").expect(422);
    });

    it("devolve 422 para catálogo fora do enum", async () => {
        await context.http().get("/v1/donki/cme-analysis?catalog=INVENTADO").expect(422);
    });

    it("devolve 422 para tipo de notificação fora do enum", async () => {
        await context.http().get("/v1/donki/notifications?type=qualquer").expect(422);
    });
});
