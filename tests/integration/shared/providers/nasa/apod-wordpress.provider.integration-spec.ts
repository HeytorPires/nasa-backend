import { ApodWordPressProvider } from "src/shared/providers/nasa/implementation/apod-wordpress.provider";
import { buildProvider } from "tests/support/upstream-provider";
import { UpstreamServer } from "tests/support/upstream-server";

function payload(date: string) {
    const [year, month, day] = date.split("-");

    return {
        date,
        post_id: 1,
        title: `APOD ${date}`,
        permalink: `https://science.nasa.gov/artigo-${year}${month}${day}`,
        media_type: "image",
        explanation: "<strong>Explanation:&nbsp;</strong>Uma <a href='#'>galáxia</a>.",
        credit: "Fotógrafo",
        alt: "Uma galáxia espiral",
        url: "https://science.nasa.gov/artigo",
        hdurl: `https://assets.science.nasa.gov/${date}.jpg`,
    };
}

describe("ApodWordPressProvider (integração)", () => {
    let server: UpstreamServer;
    let provider: ApodWordPressProvider;

    beforeAll(async () => {
        server = new UpstreamServer();
        const baseUrl = await server.start();
        provider = buildProvider(
            (httpClient, envConfigService) => new ApodWordPressProvider(httpClient, envConfigService),
            baseUrl,
        );
    });

    afterAll(async () => {
        await server.stop();
    });

    beforeEach(() => server.reset());

    it("busca pela rota por data, convertendo YYYY-MM-DD no slug YYMMDD", async () => {
        server.get("/apod-basic/240501", payload("2024-05-01"));

        await provider.getApod("2024-05-01");

        expect(server.requests[0].path).toBe("/apod-basic/240501");
    });

    it("não envia api_key para science.nasa.gov", async () => {
        server.get("/apod-basic/240501", payload("2024-05-01"));

        await provider.getApod("2024-05-01");

        expect(server.requests[0].query).toEqual({});
    });

    it("mapeia hdurl para url e remove o HTML da explicação", async () => {
        server.get("/apod-basic/240501", payload("2024-05-01"));

        const apod = await provider.getApod("2024-05-01");

        expect(apod).toMatchObject({
            date: "2024-05-01",
            url: "https://assets.science.nasa.gov/2024-05-01.jpg",
            hdurl: "https://assets.science.nasa.gov/2024-05-01.jpg",
            copyright: "Fotógrafo",
        });
        expect(apod?.explanation).toBe("Explanation: Uma galáxia.");
    });

    it("trata 404 do upstream como ausência, não como erro", async () => {
        server.getWithStatus("/apod-basic/900101", 404);

        await expect(provider.getApod("1990-01-01")).resolves.toBeNull();
    });

    it("propaga indisponibilidade do upstream", async () => {
        server.getWithStatus("/apod-basic/240501", 503);

        await expect(provider.getApod("2024-05-01")).rejects.toThrow(/indisponível/);
    });

    it("monta o intervalo com uma requisição por dia, ordenado e sem as datas ausentes", async () => {
        server.get("/apod-basic/240501", payload("2024-05-01"));
        server.getWithStatus("/apod-basic/240502", 404);
        server.get("/apod-basic/240503", payload("2024-05-03"));

        const result = await provider.getApodBetweenDates("2024-05-01", "2024-05-03");

        expect(server.requestsMatching("/apod-basic/")).toHaveLength(3);
        expect(result.map((apod) => apod.date)).toEqual(["2024-05-01", "2024-05-03"]);
    });

    it("sorteia datas distintas dentro do período de publicação do APOD", async () => {
        for (let year = 95; year <= 99; year++) {
            for (const month of ["01", "06", "12"]) {
                server.get(`/apod-basic/${year}${month}15`, payload(`19${year}-${month}-15`));
            }
        }

        const result = await provider.getRandomApod(3);

        expect(server.requestsMatching("/apod-basic/").length).toBeGreaterThanOrEqual(3);
        for (const apod of result) {
            expect(new Date(apod.date).getTime()).toBeGreaterThanOrEqual(new Date("1995-06-16").getTime());
        }
    });
});
