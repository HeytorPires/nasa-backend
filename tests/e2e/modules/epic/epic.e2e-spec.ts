import { createTestApp, TestApp } from "tests/support/test-app";

const IMAGE = {
    identifier: "20190530011359",
    caption: "Earth",
    image: "epic_1b_20190530011359",
    version: "03",
    date: "2019-05-30 01:09:10",
    centroid_coordinates: { lat: 0, lon: 0 },
    dscovr_j2000_position: { x: 0, y: 0, z: 0 },
    lunar_j2000_position: { x: 0, y: 0, z: 0 },
    sun_j2000_position: { x: 0, y: 0, z: 0 },
    attitude_quaternions: { q0: 0.5 },
};

describe("EPIC (e2e)", () => {
    let context: TestApp;

    beforeAll(async () => {
        context = await createTestApp();
    });

    afterAll(async () => {
        await context.close();
    });

    beforeEach(async () => {
        await context.reset(["epic_images"]);
    });

    it("acrescenta a URL do arquivo público e persiste a data extraída do timestamp", async () => {
        context.upstream.on("/natural", [IMAGE]);

        const response = await context.http().get("/v1/epic/natural/latest").expect(200);

        expect((response.body as { archive_url: string }[])[0].archive_url).toBe(
            "https://epic.gsfc.nasa.gov/archive/natural/2019/05/30/png/epic_1b_20190530011359.png",
        );

        const rows = await context.dataSource.query<{ captured_on: string }[]>(
            `SELECT TO_CHAR(captured_on, 'YYYY-MM-DD') AS captured_on FROM epic_images`,
        );
        expect(rows[0].captured_on).toBe("2019-05-30");
    });

    it("busca por data responde do banco na chamada seguinte", async () => {
        context.upstream.on("/natural/date/2019-05-30", [IMAGE]);

        await context.http().get("/v1/epic/natural/date/2019-05-30").expect(200);
        context.cache.clear();
        await context.http().get("/v1/epic/natural/date/2019-05-30").expect(200);

        expect(context.upstream.callsMatching("/natural/date/2019-05-30")).toHaveLength(1);
    });

    it("devolve 404 quando não há imagem na data", async () => {
        context.upstream.on("/natural/date/1990-01-01", []);

        await context.http().get("/v1/epic/natural/date/1990-01-01").expect(404);
    });

    it("devolve 422 para coleção inexistente", async () => {
        await context.http().get("/v1/epic/infravermelha/latest").expect(422);
    });

    it("devolve 422 para data malformada", async () => {
        await context.http().get("/v1/epic/natural/date/30-05-2019").expect(422);
    });

    it("lista as datas disponíveis", async () => {
        context.upstream.on("/natural/all", [{ date: "2026-09-08" }, { date: "2026-09-07" }]);

        const response = await context.http().get("/v1/epic/natural/dates").expect(200);

        expect(response.body).toEqual(["2026-09-08", "2026-09-07"]);
    });
});
