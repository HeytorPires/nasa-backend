import {
    BadGatewayException,
    HttpException,
    Injectable,
    Logger,
    NotFoundException,
    ServiceUnavailableException,
} from "@nestjs/common";
import axios, { AxiosError, AxiosInstance } from "axios";

import type {
    HttpQueryParams,
    HttpRequestOptions,
    IHttpClientProvider,
} from "../models/http-client-provider.interface";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 2;
const BASE_BACKOFF_MS = 300;

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

@Injectable()
export class AxiosHttpClient implements IHttpClientProvider {
    private readonly logger = new Logger(AxiosHttpClient.name);
    private readonly client: AxiosInstance = axios.create();

    async get<T>(url: string, options: HttpRequestOptions = {}): Promise<T> {
        const { params, timeout = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, headers, context } = options;

        const searchParams = this.buildSearchParams(params);
        const upstream = context ?? new URL(url).host;

        let lastError: AxiosError | undefined;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await this.client.get<T>(url, { params: searchParams, timeout, headers });

                this.logRateLimit(upstream, response.headers as Record<string, string | undefined>);

                if (response.data === undefined || (response.data as unknown) === "") {
                    throw new BadGatewayException(`${upstream} retornou uma resposta vazia.`);
                }

                return response.data;
            } catch (error) {
                if (error instanceof HttpException) {
                    throw error;
                }

                lastError = error as AxiosError;

                if (attempt === retries || !this.isRetryable(lastError)) {
                    break;
                }

                const delay = BASE_BACKOFF_MS * 2 ** attempt;
                this.logger.warn(
                    `${upstream} falhou (${this.describe(lastError)}). Nova tentativa em ${delay}ms ` +
                        `(${attempt + 1}/${retries}).`,
                );
                await this.sleep(delay);
            }
        }

        throw this.toHttpException(upstream, lastError);
    }

    private buildSearchParams(params?: HttpQueryParams): URLSearchParams | undefined {
        if (!params) {
            return undefined;
        }

        const searchParams = new URLSearchParams();

        for (const [key, value] of Object.entries(params)) {
            if (value === undefined || value === null || value === "") {
                continue;
            }
            searchParams.append(key, String(value));
        }

        return searchParams;
    }

    private isRetryable(error: AxiosError): boolean {
        if (!error.response) {
            return true;
        }
        return RETRYABLE_STATUS.has(error.response.status);
    }

    private toHttpException(upstream: string, error?: AxiosError): HttpException {
        const status = error?.response?.status;

        if (status === 404) {
            return new NotFoundException(`${upstream} não encontrou o recurso solicitado.`);
        }

        if (status && status >= 400 && status < 500 && status !== 429) {
            return new BadGatewayException(
                `${upstream} rejeitou a requisição (HTTP ${status}): ${this.describe(error)}`,
            );
        }

        return new ServiceUnavailableException(`${upstream} indisponível: ${this.describe(error)}`);
    }

    private describe(error?: AxiosError): string {
        if (!error) {
            return "erro desconhecido";
        }
        const status = error.response?.status;
        return status ? `HTTP ${status} - ${error.message}` : error.message;
    }

    private logRateLimit(upstream: string, headers: Record<string, string | undefined>): void {
        const remaining = headers["x-ratelimit-remaining"];

        if (remaining === undefined) {
            return;
        }

        const remainingCount = Number(remaining);

        if (Number.isFinite(remainingCount) && remainingCount <= 50) {
            this.logger.warn(`${upstream}: restam apenas ${remainingCount} requisições na janela de rate limit.`);
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
