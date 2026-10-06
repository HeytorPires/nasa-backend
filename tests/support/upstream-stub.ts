import { NotFoundException } from "@nestjs/common";

import type {
    HttpRequestOptions,
    IHttpClientProvider,
} from "../../src/shared/providers/http/models/http-client-provider.interface";

export interface RecordedCall {
    url: string;
    params: Record<string, string>;
}

export class UpstreamStub implements IHttpClientProvider {
    readonly calls: RecordedCall[] = [];

    private readonly responses = new Map<string, unknown>();
    private readonly failures = new Map<string, Error>();

    on(urlFragment: string, response: unknown): this {
        this.responses.set(urlFragment, response);
        return this;
    }

    failOn(urlFragment: string, error: Error): this {
        this.failures.set(urlFragment, error);
        return this;
    }

    get<T>(url: string, options?: HttpRequestOptions): Promise<T> {
        this.calls.push({ url, params: this.normalizeParams(options) });

        const failure = this.bestMatch(url, this.failures);

        if (failure) {
            return Promise.reject(failure);
        }

        const response = this.bestMatch(url, this.responses);

        if (response !== undefined) {
            return Promise.resolve(response as T);
        }

        return Promise.reject(new NotFoundException(`Sem resposta configurada no stub para ${url}`));
    }

    callsMatching(urlFragment: string): RecordedCall[] {
        return this.calls.filter((call) => call.url.includes(urlFragment));
    }

    reset(): void {
        this.calls.length = 0;
        this.responses.clear();
        this.failures.clear();
    }

    private bestMatch<T>(url: string, candidates: Map<string, T>): T | undefined {
        let match: { fragment: string; value: T } | undefined;

        for (const [fragment, value] of candidates) {
            if (url.includes(fragment) && (!match || fragment.length > match.fragment.length)) {
                match = { fragment, value };
            }
        }

        return match?.value;
    }

    private normalizeParams(options?: HttpRequestOptions): Record<string, string> {
        const params: Record<string, string> = {};

        for (const [key, value] of Object.entries(options?.params ?? {})) {
            if (value !== undefined && value !== null) {
                params[key] = String(value);
            }
        }

        return params;
    }
}
