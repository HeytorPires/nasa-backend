import { MediaProvider } from "src/shared/providers/media/implementation/media-provider";
import { buildProvider } from "tests/support/upstream-provider";
import { UpstreamServer } from "tests/support/upstream-server";

describe("MediaProvider (integração)", () => {
    let server: UpstreamServer;
    let provider: MediaProvider;

    beforeAll(async () => {
        server = new UpstreamServer();
        const baseUrl = await server.start();
        provider = buildProvider(
            (httpClient, envConfigService) => new MediaProvider(httpClient, envConfigService),
            baseUrl,
        );
    });

    afterAll(async () => {
        await server.stop();
    });

    beforeEach(() => server.reset());

    it("traduz os nomes camelCase do DTO para o snake_case do upstream", async () => {
        server.get("/search", { collection: { version: "1.1", href: "", items: [], metadata: { total_hits: 0 } } });

        await provider.search({ q: "apollo 11", mediaType: "image", yearStart: 1969, yearEnd: 1972, pageSize: 20 });

        expect(server.requests[0].query).toEqual({
            q: "apollo 11",
            media_type: "image",
            year_start: "1969",
            year_end: "1972",
            page_size: "20",
        });
    });

    it("não envia api_key: images.nasa.gov é aberto", async () => {
        server.get("/search", { collection: { version: "1.1", href: "", items: [], metadata: { total_hits: 0 } } });

        await provider.search({ q: "moon" });

        expect(server.requests[0].query).toEqual({ q: "moon" });
    });

    it("escapa o nasa_id no caminho dos endpoints de asset", async () => {
        server.get("/asset/as11%2F42", { collection: { version: "1.1", href: "", items: [] } });

        await provider.getAsset("as11/42");

        expect(server.requests[0].path).toBe("/asset/as11%2F42");
    });

    it("usa caminhos distintos para asset, metadata e captions", async () => {
        for (const prefix of ["asset", "metadata", "captions"]) {
            server.get(`/${prefix}/as11`, { collection: { version: "1.1", href: "", items: [] } });
        }

        await provider.getAsset("as11");
        await provider.getMetadataLocation("as11");
        await provider.getCaptionsLocation("as11");

        expect(server.requests.map((request) => request.path)).toEqual([
            "/asset/as11",
            "/metadata/as11",
            "/captions/as11",
        ]);
    });
});
