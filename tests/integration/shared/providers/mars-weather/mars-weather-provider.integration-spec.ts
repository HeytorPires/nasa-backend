import { MarsWeatherProvider } from "src/shared/providers/mars-weather/implementation/mars-weather-provider";
import { buildProvider, TEST_API_KEY } from "tests/support/upstream-provider";
import { UpstreamServer } from "tests/support/upstream-server";

describe("MarsWeatherProvider (integração)", () => {
    let server: UpstreamServer;
    let provider: MarsWeatherProvider;

    beforeAll(async () => {
        server = new UpstreamServer();
        const baseUrl = await server.start();
        provider = buildProvider(
            (httpClient, envConfigService) => new MarsWeatherProvider(httpClient, envConfigService),
            baseUrl,
        );
    });

    afterAll(async () => {
        await server.stop();
    });

    beforeEach(() => server.reset());

    it("envia api_key, feedtype e versão exigidos pelo InSight", async () => {
        server.get("/insight_weather/", { sol_keys: [] });

        await provider.getLatest();

        expect(server.requests[0].query).toEqual({
            api_key: TEST_API_KEY,
            feedtype: "json",
            ver: "1.0",
        });
    });

    it("devolve a resposta com os sols chaveados pelo número", async () => {
        server.get("/insight_weather/", {
            "675": { AT: { av: -62.3, ct: 1, mn: -96, mx: -15 }, First_UTC: "", Last_UTC: "", Season: "fall" },
            sol_keys: ["675"],
            validity_checks: {},
        });

        const response = await provider.getLatest();

        expect(response.sol_keys).toEqual(["675"]);
        expect(response["675"]).toMatchObject({ Season: "fall" });
    });
});
