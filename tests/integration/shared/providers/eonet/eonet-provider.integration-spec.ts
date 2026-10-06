import { EonetProvider } from "src/shared/providers/eonet/implementation/eonet-provider";
import { buildProvider } from "tests/support/upstream-provider";
import { UpstreamServer } from "tests/support/upstream-server";

describe("EonetProvider (integração)", () => {
    let server: UpstreamServer;
    let provider: EonetProvider;

    beforeAll(async () => {
        server = new UpstreamServer();
        const baseUrl = await server.start();
        provider = buildProvider(
            (httpClient, envConfigService) => new EonetProvider(httpClient, envConfigService),
            baseUrl,
        );
    });

    afterAll(async () => {
        await server.stop();
    });

    beforeEach(() => server.reset());

    it("não envia api_key: o EONET é um serviço aberto", async () => {
        server.get("/events", { title: "", description: "", link: "", events: [] });

        await provider.getEvents({ status: "open", limit: 10 });

        expect(server.requests[0].query).toEqual({ status: "open", limit: "10" });
    });

    it("desembrulha a coleção e devolve os eventos", async () => {
        server.get("/events", {
            title: "",
            description: "",
            link: "",
            events: [{ id: "EONET_1", categories: [{ id: "wildfires", title: "Wildfires" }] }],
        });

        const events = await provider.getEvents({});

        expect(events).toHaveLength(1);
        expect(events[0].id).toBe("EONET_1");
    });

    it("devolve lista vazia quando a coleção não traz o campo events", async () => {
        server.get("/events", { title: "", description: "", link: "" });

        await expect(provider.getEvents({})).resolves.toEqual([]);
    });

    it("omite filtros não informados da query string", async () => {
        server.get("/events", { title: "", description: "", link: "", events: [] });

        await provider.getEvents({ category: "wildfires" });

        expect(server.requests[0].query).toEqual({ category: "wildfires" });
    });

    it("layers sem categoria e com categoria usam caminhos diferentes", async () => {
        server.get("/layers", { categories: [] });
        server.get("/layers/wildfires", { categories: [] });

        await provider.getLayers();
        await provider.getLayers("wildfires");

        expect(server.requests.map((request) => request.path)).toEqual(["/layers", "/layers/wildfires"]);
    });

    it("desembrulha categorias e fontes", async () => {
        server.get("/categories", { title: "", description: "", link: "", categories: [{ id: "drought" }] });
        server.get("/sources", { title: "", description: "", link: "", sources: [{ id: "JTWC" }] });

        await expect(provider.getCategories()).resolves.toHaveLength(1);
        await expect(provider.getSources()).resolves.toHaveLength(1);
    });
});
