import { TechTransferProvider } from "src/shared/providers/tech-transfer/implementation/tech-transfer-provider";
import { buildProvider } from "tests/support/upstream-provider";
import { UpstreamServer } from "tests/support/upstream-server";

function row(id: string, title: string) {
    return [
        id,
        "LEW-TOPS-168",
        title,
        'Descrição do <span class="highlight">motor</span>.',
        "LEW-TOPS-168",
        "Power Generation",
        "",
        "",
        "",
        "GRC",
        "https://example.com/img.jpg",
        "",
        16.07,
    ];
}

describe("TechTransferProvider (integração)", () => {
    let server: UpstreamServer;
    let provider: TechTransferProvider;

    beforeAll(async () => {
        server = new UpstreamServer();
        const baseUrl = await server.start();
        provider = buildProvider(
            (httpClient, envConfigService) => new TechTransferProvider(httpClient, envConfigService),
            baseUrl,
        );
    });

    afterAll(async () => {
        await server.stop();
    });

    beforeEach(() => server.reset());

    it("consulta o backend real do portal, com categoria e termo no caminho", async () => {
        server.get("/patent/engine", { results: [], count: 0, total: 0, page: 1, perpage: 10 });

        await provider.search("patent", "engine");

        expect(server.requests[0].path).toBe("/patent/engine");
        expect(server.requests[0].query).toEqual({});
    });

    it("escapa o termo de busca no caminho", async () => {
        server.get("/patent/solar%20panel", { results: [], count: 0, total: 0, page: 1, perpage: 10 });

        await provider.search("patent", "solar panel");

        expect(server.requests[0].path).toBe("/patent/solar%20panel");
    });

    it("converte os arrays posicionais em objetos nomeados", async () => {
        server.get("/patent/engine", {
            results: [row("64e7", 'Next Generation <span class="highlight">Engine</span>')],
            count: 1,
            total: 1,
            page: 1,
            perpage: 10,
        });

        const result = await provider.search("patent", "engine");

        expect(result.results[0]).toEqual({
            id: "64e7",
            case_number: "LEW-TOPS-168",
            title: "Next Generation Engine",
            description: "Descrição do motor.",
            category: "Power Generation",
            center: "GRC",
            image_url: "https://example.com/img.jpg",
        });
    });

    it("normaliza campos ausentes sem quebrar", async () => {
        server.get("/software/x", { results: [[]], count: 1, total: 1, page: 1, perpage: 10 });

        const result = await provider.search("software", "x");

        expect(result.results[0]).toMatchObject({ id: "", title: "", image_url: null });
    });
});
