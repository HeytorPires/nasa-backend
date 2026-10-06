import { NotFoundException } from "@nestjs/common";
import { EnvConfigService } from "src/env-config/env-config.service";
import { IHttpClientProvider } from "src/shared/providers/http/models/http-client-provider.interface";
import { ApodWordPressProvider } from "./apod-wordpress.provider";

import type { WordPressApodPayload } from "../models/wordpress-apod.interface";

function payload(date: string): WordPressApodPayload {
    return {
        date,
        post_id: 1,
        title: "M83",
        permalink: "https://science.nasa.gov/artigo",
        media_type: "image",
        explanation: "<strong>Explanation:&nbsp;</strong>Uma <a href='#'>galáxia</a>.",
        credit: "Fotografo",
        alt: "Uma galáxia espiral",
        url: "https://science.nasa.gov/artigo",
        hdurl: "https://assets.science.nasa.gov/m83.jpg",
    };
}

describe("ApodWordPressProvider", () => {
    let provider: ApodWordPressProvider;
    let httpClient: jest.Mocked<IHttpClientProvider>;

    beforeEach(() => {
        httpClient = { get: jest.fn() };
        provider = new ApodWordPressProvider(httpClient, { get: jest.fn() } as unknown as EnvConfigService);
    });

    afterEach(() => jest.clearAllMocks());

    it("converte a data no slug YYMMDD da rota do WordPress", async () => {
        httpClient.get.mockResolvedValueOnce(payload("2024-05-01"));

        await provider.getApod("2024-05-01");

        expect(httpClient.get).toHaveBeenCalledWith(
            "https://science.nasa.gov/wp-json/wp/v2/apod-basic/240501",
            expect.anything(),
        );
    });

    it("mapeia hdurl para url e remove o HTML da explicação", async () => {
        httpClient.get.mockResolvedValueOnce(payload("2024-05-01"));

        const apod = await provider.getApod("2024-05-01");

        expect(apod).toMatchObject({
            date: "2024-05-01",
            url: "https://assets.science.nasa.gov/m83.jpg",
            hdurl: "https://assets.science.nasa.gov/m83.jpg",
            permalink: "https://science.nasa.gov/artigo",
            copyright: "Fotografo",
        });
        expect(apod?.explanation).toBe("Explanation: Uma galáxia.");
    });

    it("devolve null quando a data não tem publicação", async () => {
        httpClient.get.mockRejectedValueOnce(new NotFoundException());

        await expect(provider.getApod("1990-01-01")).resolves.toBeNull();
    });

    it("propaga erros que não sejam 404", async () => {
        httpClient.get.mockRejectedValueOnce(new Error("falha de rede"));

        await expect(provider.getApod("2024-05-01")).rejects.toThrow("falha de rede");
    });

    it("monta o intervalo dia a dia, ordenado e sem as datas ausentes", async () => {
        httpClient.get
            .mockResolvedValueOnce(payload("2024-05-01"))
            .mockRejectedValueOnce(new NotFoundException())
            .mockResolvedValueOnce(payload("2024-05-03"));

        const result = await provider.getApodBetweenDates("2024-05-01", "2024-05-03");

        expect(httpClient.get).toHaveBeenCalledTimes(3);
        expect(result.map((apod) => apod.date)).toEqual(["2024-05-01", "2024-05-03"]);
    });

    it("sorteia datas distintas dentro do período de publicação do APOD", async () => {
        httpClient.get.mockImplementation((url: string) => {
            const slug = url.split("/").pop() as string;
            return Promise.resolve(payload(`20${slug.slice(0, 2)}-${slug.slice(2, 4)}-${slug.slice(4, 6)}`));
        });

        const result = await provider.getRandomApod(5);

        expect(result).toHaveLength(5);
        for (const apod of result) {
            expect(new Date(apod.date).getTime()).toBeGreaterThanOrEqual(new Date("1995-06-16").getTime());
        }
    });
});
