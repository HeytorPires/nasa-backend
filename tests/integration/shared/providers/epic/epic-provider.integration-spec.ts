import { EpicProvider } from "src/shared/providers/epic/implementation/epic-provider";
import { buildProvider } from "tests/support/upstream-provider";
import { UpstreamServer } from "tests/support/upstream-server";

describe("EpicProvider (integração)", () => {
    let server: UpstreamServer;
    let provider: EpicProvider;

    beforeAll(async () => {
        server = new UpstreamServer();
        const baseUrl = await server.start();
        provider = buildProvider(
            (httpClient, envConfigService) => new EpicProvider(httpClient, envConfigService),
            baseUrl,
        );
    });

    afterAll(async () => {
        await server.stop();
    });

    beforeEach(() => server.reset());

    it("não envia api_key: o host do EPIC é aberto", async () => {
        server.get("/natural", []);

        await provider.getLatest("natural");

        expect(server.requests[0].query).toEqual({});
    });

    it("usa caminhos distintos por coleção e por data", async () => {
        server.get("/natural", []);
        server.get("/enhanced/date/2019-05-30", []);

        await provider.getLatest("natural");
        await provider.getByDate("enhanced", "2019-05-30");

        expect(server.requests.map((request) => request.path)).toEqual(["/natural", "/enhanced/date/2019-05-30"]);
    });

    it("achata a listagem de datas disponíveis", async () => {
        server.get("/natural/all", [{ date: "2026-09-08" }, { date: "2026-09-07" }]);

        await expect(provider.getAvailableDates("natural")).resolves.toEqual(["2026-09-08", "2026-09-07"]);
    });

    it("monta a URL do arquivo público a partir da data e do nome do arquivo", () => {
        expect(provider.buildArchiveUrl("natural", "2019-05-30", "epic_1b_20190530011359")).toBe(
            "https://epic.gsfc.nasa.gov/archive/natural/2019/05/30/png/epic_1b_20190530011359.png",
        );
    });
});
