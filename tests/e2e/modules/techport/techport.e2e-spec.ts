import { createTestApp, TestApp } from "tests/support/test-app";

describe("TechPort (e2e)", () => {
    let context: TestApp;

    beforeAll(async () => {
        context = await createTestApp();
    });

    afterAll(async () => {
        await context.close();
    });

    beforeEach(async () => {
        await context.reset(["techport_projects"]);
    });

    it("normaliza a data YYYY-M-D do upstream ao persistir a listagem", async () => {
        context.upstream.on("/projects", {
            projects: [{ projectId: 93851, lastUpdated: "2026-9-10" }],
            totalCount: 1,
        });

        await context.http().get("/v1/techport/projects?updatedSince=2026-09-01").expect(200);

        const rows = await context.dataSource.query<{ last_updated: string }[]>(
            `SELECT TO_CHAR(last_updated, 'YYYY-MM-DD') AS last_updated FROM techport_projects`,
        );
        expect(rows[0].last_updated).toBe("2026-09-10");
    });

    it("busca o detalhe quando o banco só tem o resumo da listagem", async () => {
        context.upstream
            .on("/projects", { projects: [{ projectId: 93851, lastUpdated: "2026-9-10" }], totalCount: 1 })
            .on("/projects/93851", { project: { projectId: 93851, title: "Projeto" } });

        await context.http().get("/v1/techport/projects?updatedSince=2026-09-01").expect(200);
        const response = await context.http().get("/v1/techport/projects/93851").expect(200);

        expect(response.body).toMatchObject({ title: "Projeto" });
        expect(context.upstream.callsMatching("/projects/93851")).toHaveLength(1);
    });

    it("responde o detalhe do banco na chamada seguinte", async () => {
        context.upstream.on("/projects/93851", { project: { projectId: 93851, title: "Projeto" } });

        await context.http().get("/v1/techport/projects/93851").expect(200);
        context.cache.clear();
        await context.http().get("/v1/techport/projects/93851").expect(200);

        expect(context.upstream.callsMatching("/projects/93851")).toHaveLength(1);
    });

    it("devolve 422 para id de projeto não numérico", async () => {
        await context.http().get("/v1/techport/projects/abc").expect(422);
    });

    it("devolve 422 para updatedSince malformado", async () => {
        await context.http().get("/v1/techport/projects?updatedSince=01-01-2026").expect(422);
    });
});
