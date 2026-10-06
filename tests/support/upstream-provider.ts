import { EnvConfigService } from "../../src/env-config/env-config.service";
import { AxiosHttpClient } from "../../src/shared/providers/http/implementation/axios-http-client";

import type { UpstreamHttpProvider } from "../../src/shared/providers/base/upstream-http.provider";

export const TEST_API_KEY = "chave-de-teste";

export function fakeEnvConfigService(apiKey = TEST_API_KEY): EnvConfigService {
    return { get: () => apiKey } as unknown as EnvConfigService;
}

export function buildProvider<T extends UpstreamHttpProvider>(
    factory: (httpClient: AxiosHttpClient, envConfigService: EnvConfigService) => T,
    baseUrl: string,
    options: { apiKey?: string } = {},
): T {
    const provider = factory(new AxiosHttpClient(), fakeEnvConfigService(options.apiKey));

    Object.defineProperty(provider, "baseUrl", { value: baseUrl, writable: true });

    return provider;
}
