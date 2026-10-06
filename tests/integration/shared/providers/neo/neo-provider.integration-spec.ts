import { NeoProvider } from "src/shared/providers/neo/implementation/neo-provider";
import { buildProvider, TEST_API_KEY } from "tests/support/upstream-provider";
import { UpstreamServer } from "tests/support/upstream-server";

describe("NeoProvider (integração)", () => {
    let server: UpstreamServer;
    let provider: NeoProvider;

    beforeAll(async () => {
        server = new UpstreamServer();
        const baseUrl = await server.start();
        provider = buildProvider(
            (httpClient, envConfigService) => new NeoProvider(httpClient, envConfigService),
            baseUrl,
        );
    });

    afterAll(async () => {
        await server.stop();
    });

    beforeEach(() => server.reset());

    it("envia a api_key e o intervalo no formato da NeoWs", async () => {
        server.get("/feed", { element_count: 0, near_earth_objects: {} });

        await provider.getFeed("2024-05-01", "2024-05-02");

        expect(server.requests[0].query).toEqual({
            api_key: TEST_API_KEY,
            start_date: "2024-05-01",
            end_date: "2024-05-02",
        });
    });

    it("redige a api_key que a NeoWs devolve nos links da resposta", async () => {
        server.get("/feed", {
            links: { next: `http://api.nasa.gov/neo/rest/v1/feed?start_date=2024-05-02&api_key=${TEST_API_KEY}` },
            element_count: 1,
            near_earth_objects: {
                "2024-05-01": [
                    {
                        neo_reference_id: "3542519",
                        links: { self: `http://api.nasa.gov/neo/rest/v1/neo/3542519?api_key=${TEST_API_KEY}` },
                    },
                ],
            },
        });

        const feed = await provider.getFeed("2024-05-01", "2024-05-02");
        const serialized = JSON.stringify(feed);

        expect(serialized).not.toContain(TEST_API_KEY);
        expect(serialized).toContain("api_key=REDACTED");
    });

    it("monta o caminho do lookup com o id do asteroide", async () => {
        server.get("/neo/3542519", { neo_reference_id: "3542519" });

        await provider.getById("3542519");

        expect(server.requests[0].path).toBe("/neo/3542519");
    });

    it("repassa paginação no browse", async () => {
        server.get("/neo/browse", { page: {}, near_earth_objects: [] });

        await provider.browse(2, 50);

        expect(server.requests[0].query).toMatchObject({ page: "2", size: "50" });
    });

    it("traduz 404 do lookup em NotFoundException", async () => {
        server.getWithStatus("/neo/999", 404);

        await expect(provider.getById("999")).rejects.toThrow(/não encontrou/);
    });
});
