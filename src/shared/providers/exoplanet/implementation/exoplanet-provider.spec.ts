import { EnvConfigService } from "src/env-config/env-config.service";
import { IHttpClientProvider } from "src/shared/providers/http/models/http-client-provider.interface";
import { ExoplanetProvider } from "./exoplanet-provider";

describe("ExoplanetProvider", () => {
    let provider: ExoplanetProvider;
    let httpClient: jest.Mocked<IHttpClientProvider>;

    function lastAdql(): string {
        return (httpClient.get.mock.calls[0][1]?.params as Record<string, string>).query;
    }

    beforeEach(() => {
        httpClient = { get: jest.fn().mockResolvedValue([]) };
        provider = new ExoplanetProvider(httpClient, { get: jest.fn() } as unknown as EnvConfigService);
    });

    afterEach(() => jest.clearAllMocks());

    it("monta o ADQL com TOP e todas as colunas da allowlist", async () => {
        await provider.query({ filters: [], limit: 10 });

        expect(lastAdql()).toContain("select top 10 pl_name,hostname");
        expect(lastAdql()).toContain("from pscomppars");
    });

    it("escapa aspas simples nos literais", async () => {
        await provider.query({ filters: [{ column: "pl_name", operator: "eq", value: "a' or '1'='1" }], limit: 1 });

        expect(lastAdql()).toContain("pl_name = 'a'' or ''1''=''1'");
    });

    it("recusa coluna fora da allowlist", async () => {
        await expect(
            provider.query({
                filters: [{ column: "pl_name; drop table x" as never, operator: "eq", value: 1 }],
                limit: 1,
            }),
        ).rejects.toThrow("Coluna não permitida");
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it("recusa operador fora do mapa fechado", async () => {
        await expect(
            provider.query({ filters: [{ column: "pl_name", operator: "; --" as never, value: 1 }], limit: 1 }),
        ).rejects.toThrow("Operador não permitido");
    });

    it("aplica o teto de linhas mesmo com limit acima do máximo", async () => {
        await provider.query({ filters: [], limit: 99999 });

        expect(lastAdql()).toContain("select top 500 ");
    });

    it("ignora orderBy que não esteja na allowlist", async () => {
        await provider.query({ filters: [], limit: 1, orderBy: "1; drop table x" as never });

        expect(lastAdql()).not.toContain("order by");
    });

    it("recusa valor numérico não finito", async () => {
        await expect(
            provider.query({ filters: [{ column: "pl_rade", operator: "gte", value: Number.NaN }], limit: 1 }),
        ).rejects.toThrow("Valor numérico inválido");
    });
});
