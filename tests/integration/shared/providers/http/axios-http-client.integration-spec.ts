import { BadGatewayException, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { AxiosHttpClient } from "src/shared/providers/http/implementation/axios-http-client";
import { UpstreamServer } from "tests/support/upstream-server";

describe("AxiosHttpClient (integração)", () => {
    let server: UpstreamServer;
    let httpClient: AxiosHttpClient;
    let baseUrl: string;

    beforeAll(async () => {
        server = new UpstreamServer();
        baseUrl = await server.start();
    });

    afterAll(async () => {
        await server.stop();
    });

    beforeEach(() => {
        server.reset();
        httpClient = new AxiosHttpClient();
    });

    it("serializa os parâmetros e descarta os vazios", async () => {
        server.get("/recurso", { ok: true });

        await httpClient.get(`${baseUrl}/recurso`, {
            params: { a: "1", b: 2, c: true, vazio: "", nulo: null, ausente: undefined },
        });

        expect(server.requests[0].query).toEqual({ a: "1", b: "2", c: "true" });
    });

    it("tenta novamente em 429 e devolve o sucesso seguinte", async () => {
        server.getWithStatusSequence("/instavel", [429], { ok: true });

        await expect(httpClient.get(`${baseUrl}/instavel`)).resolves.toEqual({ ok: true });
        expect(server.requestsMatching("/instavel")).toHaveLength(2);
    });

    it("tenta novamente em 503 até esgotar e traduz para ServiceUnavailableException", async () => {
        server.getWithStatus("/fora-do-ar", 503);

        await expect(httpClient.get(`${baseUrl}/fora-do-ar`, { retries: 2 })).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        );
        expect(server.requestsMatching("/fora-do-ar")).toHaveLength(3);
    });

    it("não tenta novamente em 400", async () => {
        server.getWithStatus("/invalido", 400);

        await expect(httpClient.get(`${baseUrl}/invalido`)).rejects.toBeInstanceOf(BadGatewayException);
        expect(server.requestsMatching("/invalido")).toHaveLength(1);
    });

    it("traduz 404 em NotFoundException, sem nova tentativa", async () => {
        server.getWithStatus("/ausente", 404);

        await expect(httpClient.get(`${baseUrl}/ausente`)).rejects.toBeInstanceOf(NotFoundException);
        expect(server.requestsMatching("/ausente")).toHaveLength(1);
    });

    it("aborta por timeout e trata como falha transitória", async () => {
        server.getSlow("/lento", 400, { ok: true });

        await expect(httpClient.get(`${baseUrl}/lento`, { timeout: 60, retries: 1 })).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        );
        expect(server.requestsMatching("/lento")).toHaveLength(2);
    });

    it("propaga a mensagem com o nome do upstream informado no contexto", async () => {
        server.getWithStatus("/fora-do-ar", 503);

        await expect(httpClient.get(`${baseUrl}/fora-do-ar`, { retries: 0, context: "NASA DONKI" })).rejects.toThrow(
            /NASA DONKI/,
        );
    });
});
