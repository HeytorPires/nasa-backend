import { ExoplanetProvider } from "src/shared/providers/exoplanet/implementation/exoplanet-provider";
import { buildProvider } from "tests/support/upstream-provider";
import { UpstreamServer } from "tests/support/upstream-server";

describe("ExoplanetProvider (integração)", () => {
    let server: UpstreamServer;
    let provider: ExoplanetProvider;

    beforeAll(async () => {
        server = new UpstreamServer();
        const baseUrl = await server.start();
        provider = buildProvider(
            (httpClient, envConfigService) => new ExoplanetProvider(httpClient, envConfigService),
            baseUrl,
        );
    });

    afterAll(async () => {
        await server.stop();
    });

    beforeEach(() => server.reset());

    function adqlSent(): string {
        return server.requests[0].query.query;
    }

    it("envia ADQL com TOP e formato JSON", async () => {
        server.get("/sync", []);

        await provider.query({ filters: [], limit: 10 });

        expect(adqlSent()).toContain("select top 10 ");
        expect(adqlSent()).toContain("from pscomppars");
        expect(server.requests[0].query.format).toBe("json");
    });

    it("monta as condições a partir dos filtros nomeados", async () => {
        server.get("/sync", []);

        await provider.query({
            filters: [
                { column: "hostname", operator: "eq", value: "HD 2039" },
                { column: "pl_rade", operator: "gte", value: 1.5 },
            ],
            limit: 5,
            orderBy: "disc_year",
            orderDirection: "desc",
        });

        expect(adqlSent()).toContain("where hostname = 'HD 2039' and pl_rade >= 1.5");
        expect(adqlSent()).toContain("order by disc_year desc");
    });

    it("escapa aspas simples, neutralizando tentativa de injeção", async () => {
        server.get("/sync", []);

        await provider.query({
            filters: [{ column: "pl_name", operator: "eq", value: "a' or '1'='1" }],
            limit: 1,
        });

        expect(adqlSent()).toContain("pl_name = 'a'' or ''1''=''1'");
    });

    it("recusa coluna fora da allowlist antes de sair a requisição", async () => {
        server.get("/sync", []);

        await expect(
            provider.query({
                filters: [{ column: "pl_name; drop table x" as never, operator: "eq", value: 1 }],
                limit: 1,
            }),
        ).rejects.toThrow("Coluna não permitida");
        expect(server.requests).toHaveLength(0);
    });

    it("aplica o teto de 500 linhas mesmo com limit maior", async () => {
        server.get("/sync", []);

        await provider.query({ filters: [], limit: 99999 });

        expect(adqlSent()).toContain("select top 500 ");
    });

    it("normaliza resposta não-array para lista vazia", async () => {
        server.get("/sync", { erro: "consulta inválida" });

        await expect(provider.query({ filters: [], limit: 1 })).resolves.toEqual([]);
    });
});
