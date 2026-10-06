import { createTestApp, TestApp } from "tests/support/test-app";

const ROWS = [
    { pl_name: "HD 2039 b", hostname: "HD 2039", disc_year: 2002, discoverymethod: "Radial Velocity", sy_dist: 85.69 },
];

describe("Exoplanets (e2e)", () => {
    let context: TestApp;

    beforeAll(async () => {
        context = await createTestApp();
    });

    afterAll(async () => {
        await context.close();
    });

    beforeEach(async () => {
        await context.reset(["exoplanets"]);
    });

    function lastAdql(): string {
        const calls = context.upstream.callsMatching("/sync");
        return calls[calls.length - 1].params.query;
    }

    it("monta o ADQL no servidor a partir dos filtros nomeados e persiste o resultado", async () => {
        context.upstream.on("/sync", ROWS);

        await context.http().get("/v1/exoplanets?hostname=HD%202039&minRadiusEarth=1&limit=10").expect(200);

        expect(lastAdql()).toContain("where hostname = 'HD 2039' and pl_rade >= 1");
        expect(lastAdql()).toContain("select top 10 ");

        await expect(context.dataSource.query<unknown[]>(`SELECT id FROM exoplanets`)).resolves.toHaveLength(1);
    });

    it("neutraliza tentativa de injeção escapando o literal", async () => {
        context.upstream.on("/sync", []);

        await context.http().get("/v1/exoplanets?plName=a%27%20or%20%271%27%3D%271").expect(200);

        expect(lastAdql()).toContain("pl_name = 'a'' or ''1''=''1'");
    });

    it("devolve 422 para coluna de ordenação fora da allowlist", async () => {
        await context.http().get("/v1/exoplanets?orderBy=1;drop%20table%20x").expect(422);
    });

    it("devolve 422 acima do teto de linhas", async () => {
        await context.http().get("/v1/exoplanets?limit=99999").expect(422);
    });

    it("rejeita propriedade fora do DTO, fechando a porta para um `where` cru", async () => {
        await context.http().get("/v1/exoplanets?where=1%3D1").expect(422);
    });
});
