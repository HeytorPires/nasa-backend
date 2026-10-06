import { DonkiProvider } from "src/shared/providers/donki/implementation/donki-provider";
import { DONKI_EVENT_PATHS } from "src/shared/providers/donki/models/donki-response.interface";
import { buildProvider, TEST_API_KEY } from "tests/support/upstream-provider";
import { UpstreamServer } from "tests/support/upstream-server";

describe("DonkiProvider (integração)", () => {
    let server: UpstreamServer;
    let provider: DonkiProvider;

    beforeAll(async () => {
        server = new UpstreamServer();
        const baseUrl = await server.start();
        provider = buildProvider(
            (httpClient, envConfigService) => new DonkiProvider(httpClient, envConfigService),
            baseUrl,
        );
    });

    afterAll(async () => {
        await server.stop();
    });

    beforeEach(() => server.reset());

    it("mapeia cada tipo kebab-case para o caminho do upstream", async () => {
        for (const path of Object.values(DONKI_EVENT_PATHS)) {
            server.get(`/${path}`, []);
        }

        for (const eventType of Object.keys(DONKI_EVENT_PATHS)) {
            await provider.getEvents(eventType as keyof typeof DONKI_EVENT_PATHS, {});
        }

        expect(server.requests.map((request) => request.path)).toEqual(
            Object.values(DONKI_EVENT_PATHS).map((path) => `/${path}`),
        );
    });

    it("envia a api_key e o intervalo", async () => {
        server.get("/CME", []);

        await provider.getEvents("cme", { startDate: "2024-05-01", endDate: "2024-05-10" });

        expect(server.requests[0].query).toEqual({
            api_key: TEST_API_KEY,
            startDate: "2024-05-01",
            endDate: "2024-05-10",
        });
    });

    it("repassa os filtros específicos de cme-analysis", async () => {
        server.get("/CMEAnalysis", []);

        await provider.getEvents("cme-analysis", { speed: 500, halfAngle: 30, catalog: "ALL" });

        expect(server.requests[0].query).toMatchObject({ speed: "500", halfAngle: "30", catalog: "ALL" });
    });

    it("normaliza resposta nula para lista vazia", async () => {
        server.get("/GST", null);

        await expect(provider.getEvents("gst", {})).resolves.toEqual([]);
    });

    it("propaga indisponibilidade após esgotar as tentativas", async () => {
        server.getWithStatus("/FLR", 503);

        await expect(provider.getEvents("flr", {})).rejects.toThrow(/NASA DONKI/);
    });
});
