import { TleProvider } from "src/shared/providers/tle/implementation/tle-provider";
import { buildProvider } from "tests/support/upstream-provider";
import { UpstreamServer } from "tests/support/upstream-server";

describe("TleProvider (integração)", () => {
    let server: UpstreamServer;
    let provider: TleProvider;

    beforeAll(async () => {
        server = new UpstreamServer();
        const baseUrl = await server.start();
        provider = buildProvider(
            (httpClient, envConfigService) => new TleProvider(httpClient, envConfigService),
            baseUrl,
        );
    });

    afterAll(async () => {
        await server.stop();
    });

    beforeEach(() => server.reset());

    it("usa o parâmetro `page-size` com hífen, como o upstream espera", async () => {
        server.get("/tle", { totalItems: 0, member: [] });

        await provider.search("iss", 2, 50);

        expect(server.requests[0].query).toEqual({ search: "iss", page: "2", "page-size": "50" });
    });

    it("omite o termo de busca quando não informado", async () => {
        server.get("/tle", { totalItems: 0, member: [] });

        await provider.search(undefined, 1, 20);

        expect(server.requests[0].query).toEqual({ page: "1", "page-size": "20" });
    });

    it("busca por satélite pelo número NORAD no caminho", async () => {
        server.get("/tle/25544", { satelliteId: 25544, name: "ISS (ZARYA)", date: "", line1: "", line2: "" });

        const record = await provider.getBySatelliteId(25544);

        expect(server.requests[0].path).toBe("/tle/25544");
        expect(record.name).toBe("ISS (ZARYA)");
    });

    it("não envia api_key: o serviço de TLE é aberto", async () => {
        server.get("/tle/25544", { satelliteId: 25544, name: "", date: "", line1: "", line2: "" });

        await provider.getBySatelliteId(25544);

        expect(server.requests[0].query).toEqual({});
    });
});
