import { DonkiProvider } from "src/shared/providers/donki/implementation/donki-provider";
import { EonetProvider } from "src/shared/providers/eonet/implementation/eonet-provider";
import { EpicProvider } from "src/shared/providers/epic/implementation/epic-provider";
import { ExoplanetProvider } from "src/shared/providers/exoplanet/implementation/exoplanet-provider";
import { MarsWeatherProvider } from "src/shared/providers/mars-weather/implementation/mars-weather-provider";
import { MediaProvider } from "src/shared/providers/media/implementation/media-provider";
import { ApodWordPressProvider } from "src/shared/providers/nasa/implementation/apod-wordpress.provider";
import { NeoProvider } from "src/shared/providers/neo/implementation/neo-provider";
import { SsdProvider } from "src/shared/providers/ssd/implementation/ssd-provider";
import { TechTransferProvider } from "src/shared/providers/tech-transfer/implementation/tech-transfer-provider";
import { TechportProvider } from "src/shared/providers/techport/implementation/techport-provider";
import { TleProvider } from "src/shared/providers/tle/implementation/tle-provider";
import { addDays, toIsoDate } from "src/shared/utils/date.util";
import { describeSmoke, smokeEnvConfigService, smokeHttpClient } from "tests/support/smoke";

describeSmoke("Upstreams da NASA (smoke)", () => {
    const httpClient = smokeHttpClient();
    const envConfigService = smokeEnvConfigService();

    it("APOD WordPress: a rota por data devolve um objeto com data, título e mídia", async () => {
        const provider = new ApodWordPressProvider(httpClient, envConfigService);

        const apod = await provider.getApod("2024-05-01");

        expect(apod).toMatchObject({
            date: "2024-05-01",
            title: expect.any(String) as string,
            media_type: expect.any(String) as string,
            url: expect.any(String) as string,
        });
        expect(apod?.explanation).not.toContain("<strong>");
    });

    it("NeoWs: o feed devolve objetos agrupados por data e sem a nossa api_key", async () => {
        const provider = new NeoProvider(httpClient, envConfigService);

        const feed = await provider.getFeed("2024-05-01", "2024-05-02");

        expect(typeof feed.element_count).toBe("number");
        expect(Object.keys(feed.near_earth_objects)).toContain("2024-05-01");
        expect(JSON.stringify(feed)).not.toContain(process.env.NASA_API_KEY as string);
    });

    it("EONET: eventos abertos trazem id, título e categorias", async () => {
        const provider = new EonetProvider(httpClient, envConfigService);

        const [event] = await provider.getEvents({ status: "open", limit: 1 });

        expect(event).toMatchObject({
            id: expect.stringContaining("EONET_") as string,
            title: expect.any(String) as string,
            categories: expect.any(Array) as unknown[],
        });
    });

    it("EPIC: a coleção natural traz identifier, image e data", async () => {
        const provider = new EpicProvider(httpClient, envConfigService);

        const [image] = await provider.getLatest("natural");

        expect(image).toMatchObject({
            identifier: expect.any(String) as string,
            image: expect.stringContaining("epic_") as string,
            date: expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/) as string,
        });
    });

    it("InSight: a resposta traz sol_keys, ainda que vazio", async () => {
        const provider = new MarsWeatherProvider(httpClient, envConfigService);

        const response = await provider.getLatest();

        expect(Array.isArray(response.sol_keys)).toBe(true);
    });

    it("Image and Video Library: a busca devolve o envelope collection.items", async () => {
        const provider = new MediaProvider(httpClient, envConfigService);

        const response = await provider.search({ q: "apollo 11", mediaType: "image", pageSize: 2 });

        expect(response.collection.items[0].data[0]).toMatchObject({
            nasa_id: expect.any(String) as string,
            title: expect.any(String) as string,
        });
    });

    it("TechTransfer: o backend do portal ainda devolve JSON, não HTML", async () => {
        const provider = new TechTransferProvider(httpClient, envConfigService);

        const result = await provider.search("patent", "engine");

        expect(result.results.length).toBeGreaterThan(0);
        expect(result.results[0].id).toEqual(expect.any(String));
    });

    it("TLE: a busca devolve member com as duas linhas do conjunto de elementos", async () => {
        const provider = new TleProvider(httpClient, envConfigService);

        const collection = await provider.search("iss", 1, 2);

        expect(collection.member[0]).toMatchObject({
            satelliteId: expect.any(Number) as number,
            line1: expect.stringMatching(/^1 /) as string,
            line2: expect.stringMatching(/^2 /) as string,
        });
    });

    it("SSD/CNEOS: o CAD devolve a tabela fields/data", async () => {
        const provider = new SsdProvider(httpClient, envConfigService);

        const response = await provider.getCloseApproaches({
            dateMin: toIsoDate(new Date()),
            dateMax: toIsoDate(addDays(new Date(), 30)),
            distMax: "0.05",
        });

        expect(response.fields).toContain("des");
        expect(response.fields).toContain("cd");
    });

    it("TechPort: a listagem devolve projectId e lastUpdated", async () => {
        const provider = new TechportProvider(httpClient, envConfigService);

        const response = await provider.listProjects(toIsoDate(addDays(new Date(), -30)));

        expect(response.projects[0]).toMatchObject({
            projectId: expect.any(Number) as number,
            lastUpdated: expect.any(String) as string,
        });
    });

    it("Exoplanet Archive: a consulta ADQL devolve linhas da pscomppars", async () => {
        const provider = new ExoplanetProvider(httpClient, envConfigService);

        const rows = await provider.query({ filters: [], limit: 2, orderBy: "pl_name" });

        expect(rows[0]).toMatchObject({ pl_name: expect.any(String) as string });
    });

    it("DONKI: notificações devolvem um array (possivelmente vazio)", async () => {
        const provider = new DonkiProvider(httpClient, envConfigService);

        const events = await provider.getEvents("notifications", {
            startDate: toIsoDate(addDays(new Date(), -7)),
            endDate: toIsoDate(new Date()),
        });

        expect(Array.isArray(events)).toBe(true);
    });
});
