import { SsdProvider } from "src/shared/providers/ssd/implementation/ssd-provider";
import { buildProvider } from "tests/support/upstream-provider";
import { UpstreamServer } from "tests/support/upstream-server";

describe("SsdProvider (integração)", () => {
    let server: UpstreamServer;
    let provider: SsdProvider;

    beforeAll(async () => {
        server = new UpstreamServer();
        const baseUrl = await server.start();
        provider = buildProvider(
            (httpClient, envConfigService) => new SsdProvider(httpClient, envConfigService),
            baseUrl,
        );
    });

    afterAll(async () => {
        await server.stop();
    });

    beforeEach(() => server.reset());

    it("traduz os nomes camelCase do DTO para os com hífen do JPL", async () => {
        server.get("/cad.api", { count: 0, fields: [], data: [] });

        await provider.getCloseApproaches({ dateMin: "2024-01-01", dateMax: "2024-01-31", distMax: "0.05" });

        expect(server.requests[0].query).toEqual({
            "date-min": "2024-01-01",
            "date-max": "2024-01-31",
            "dist-max": "0.05",
        });
    });

    it("não envia api_key: o SSD é servido pelo JPL, fora de api.nasa.gov", async () => {
        server.get("/fireball.api", { count: 0, fields: [], data: [] });

        await provider.getFireballs({ limit: 5 });

        expect(server.requests[0].query).toEqual({ limit: "5" });
    });

    it("devolve a tabela fields/data como veio do upstream", async () => {
        server.get("/cad.api", {
            count: 1,
            fields: ["des", "cd", "dist"],
            data: [["2024 AV2", "2024-Jan-01 02:47", "0.0097"]],
        });

        const response = await provider.getCloseApproaches({});

        expect(response.fields).toEqual(["des", "cd", "dist"]);
        expect(response.data[0][0]).toBe("2024 AV2");
    });

    it("o Sentry usa `ip-min` e devolve objetos já nomeados", async () => {
        server.get("/sentry.api", { count: 1, data: [{ des: "1979 XB", ip: "8.5e-07" }] });

        const response = await provider.getSentry({ ipMin: 0.00001, des: "1979 XB" });

        expect(server.requests[0].query).toEqual({ "ip-min": "0.00001", des: "1979 XB" });
        expect(response.data[0]).toMatchObject({ des: "1979 XB" });
    });

    it("cada serviço do SSD tem seu próprio caminho", async () => {
        for (const path of ["/cad.api", "/fireball.api", "/sentry.api", "/nhats.api", "/scout.api", "/mdesign.api"]) {
            server.get(path, { count: 0, fields: [], data: [] });
        }

        await provider.getCloseApproaches({});
        await provider.getFireballs({});
        await provider.getSentry({});
        await provider.getNhats();
        await provider.getScout();
        await provider.getMissionDesign({ des: "2010 TK7" });

        expect(server.requests.map((request) => request.path)).toEqual([
            "/cad.api",
            "/fireball.api",
            "/sentry.api",
            "/nhats.api",
            "/scout.api",
            "/mdesign.api",
        ]);
    });
});
