import { createTestApp, TestApp } from "tests/support/test-app";

const RECORD = {
    satelliteId: 25544,
    name: "ISS (ZARYA)",
    date: "2026-09-10T17:22:43+00:00",
    line1: "1 25544U 98067A   26253.72411234  .00004958  00000+0  97859-4 0  9999",
    line2: "2 25544  51.6302 236.7477 0004996 126.7110 233.4338 15.49071701585011",
};

describe("TLE (e2e)", () => {
    let context: TestApp;

    beforeAll(async () => {
        context = await createTestApp();
    });

    afterAll(async () => {
        await context.close();
    });

    beforeEach(async () => {
        await context.reset(["tle_records"]);
    });

    it("persiste os TLEs da busca com a época convertida", async () => {
        context.upstream.on("/tle", { totalItems: 1, member: [RECORD] });

        await context.http().get("/v1/tle?search=iss").expect(200);

        const rows = await context.dataSource.query<{ satellite_id: number; epoch: Date }[]>(
            `SELECT satellite_id, epoch FROM tle_records`,
        );
        expect(rows[0].satellite_id).toBe(25544);
        expect(new Date(rows[0].epoch).toISOString()).toBe("2026-09-10T17:22:43.000Z");
    });

    it("guarda uma linha por época, montando o histórico que o upstream não tem", async () => {
        context.upstream.on("/tle/25544", RECORD);
        await context.http().get("/v1/tle/25544").expect(200);

        context.cache.clear();
        context.upstream.reset();
        context.upstream.on("/tle/25544", { ...RECORD, date: "2026-09-11T17:22:43+00:00" });
        await context.http().get("/v1/tle/25544").expect(200);

        await expect(
            context.dataSource.query<unknown[]>(`SELECT id FROM tle_records WHERE satellite_id = 25544`),
        ).resolves.toHaveLength(2);
    });

    it("devolve 422 para número NORAD não numérico", async () => {
        await context.http().get("/v1/tle/iss").expect(422);
    });

    it("devolve 422 para tamanho de página acima do máximo", async () => {
        await context.http().get("/v1/tle?pageSize=500").expect(422);
    });
});
