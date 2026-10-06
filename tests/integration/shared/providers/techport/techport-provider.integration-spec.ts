import { TechportProvider } from "src/shared/providers/techport/implementation/techport-provider";
import { buildProvider } from "tests/support/upstream-provider";
import { UpstreamServer } from "tests/support/upstream-server";

describe("TechportProvider (integração)", () => {
    let server: UpstreamServer;
    let provider: TechportProvider;

    beforeAll(async () => {
        server = new UpstreamServer();
        const baseUrl = await server.start();
        provider = buildProvider(
            (httpClient, envConfigService) => new TechportProvider(httpClient, envConfigService),
            baseUrl,
        );
    });

    afterAll(async () => {
        await server.stop();
    });

    beforeEach(() => server.reset());

    it("envia updatedSince e não envia api_key", async () => {
        server.get("/projects", { projects: [], totalCount: 0 });

        await provider.listProjects("2024-01-01");

        expect(server.requests[0].query).toEqual({ updatedSince: "2024-01-01" });
    });

    it("desembrulha o detalhe envelopado em `project`", async () => {
        server.get("/projects/93851", { project: { projectId: 93851, title: "Projeto" } });

        await expect(provider.getProject(93851)).resolves.toMatchObject({ title: "Projeto" });
    });

    it("aceita detalhe sem envelope", async () => {
        server.get("/projects/93851", { projectId: 93851, title: "Sem envelope" });

        await expect(provider.getProject(93851)).resolves.toMatchObject({ title: "Sem envelope" });
    });
});
