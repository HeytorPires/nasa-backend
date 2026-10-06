import { BadGatewayException, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import axios, { AxiosError } from "axios";
import { AxiosHttpClient } from "./axios-http-client";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const get = jest.fn();

function axiosErrorWithStatus(status: number): AxiosError {
    const error = new AxiosError(`Request failed with status code ${status}`);
    error.response = { status, data: {}, statusText: "", headers: {}, config: {} as never };
    return error;
}

describe("AxiosHttpClient", () => {
    let httpClient: AxiosHttpClient;

    beforeEach(() => {
        mockedAxios.create.mockReturnValue({ get } as never);
        httpClient = new AxiosHttpClient();
        jest.spyOn(global, "setTimeout").mockImplementation((callback: () => void) => {
            callback();
            return 0 as never;
        });
    });

    afterEach(() => jest.restoreAllMocks());
    afterEach(() => jest.clearAllMocks());

    it("devolve os dados e descarta parâmetros vazios da query", async () => {
        get.mockResolvedValueOnce({ data: { ok: true }, headers: {} });

        await expect(
            httpClient.get("https://api.nasa.gov/x", { params: { a: "1", b: undefined, c: null, d: "" } }),
        ).resolves.toEqual({ ok: true });

        const [, config] = get.mock.calls[0] as [string, { params: URLSearchParams }];
        const params = config.params;
        expect([...params.entries()]).toEqual([["a", "1"]]);
    });

    it("tenta novamente em 429 e devolve o sucesso seguinte", async () => {
        get.mockRejectedValueOnce(axiosErrorWithStatus(429)).mockResolvedValueOnce({ data: [1], headers: {} });

        await expect(httpClient.get("https://api.nasa.gov/x")).resolves.toEqual([1]);
        expect(get).toHaveBeenCalledTimes(2);
    });

    it("não tenta novamente em 400", async () => {
        get.mockRejectedValue(axiosErrorWithStatus(400));

        await expect(httpClient.get("https://api.nasa.gov/x")).rejects.toBeInstanceOf(BadGatewayException);
        expect(get).toHaveBeenCalledTimes(1);
    });

    it("traduz 404 em NotFoundException sem nova tentativa", async () => {
        get.mockRejectedValue(axiosErrorWithStatus(404));

        await expect(httpClient.get("https://api.nasa.gov/x")).rejects.toBeInstanceOf(NotFoundException);
        expect(get).toHaveBeenCalledTimes(1);
    });

    it("esgota as tentativas em 503 e traduz para ServiceUnavailableException", async () => {
        get.mockRejectedValue(axiosErrorWithStatus(503));

        await expect(httpClient.get("https://api.nasa.gov/x", { retries: 2 })).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        );
        expect(get).toHaveBeenCalledTimes(3);
    });

    it("trata timeout (erro sem response) como transitório", async () => {
        const timeout = new AxiosError("timeout of 10000ms exceeded");
        get.mockRejectedValue(timeout);

        await expect(httpClient.get("https://api.nasa.gov/x", { retries: 1 })).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        );
        expect(get).toHaveBeenCalledTimes(2);
    });

    it("rejeita corpo ausente sem tentar novamente", async () => {
        get.mockResolvedValue({ data: undefined, headers: {} });

        await expect(httpClient.get("https://api.nasa.gov/x")).rejects.toBeInstanceOf(BadGatewayException);
        expect(get).toHaveBeenCalledTimes(1);
    });

    it("aceita `null` como resposta legítima do upstream", async () => {
        get.mockResolvedValue({ data: null, headers: {} });

        await expect(httpClient.get("https://api.nasa.gov/x")).resolves.toBeNull();
    });
});
