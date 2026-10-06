import { EnvConfigService } from "../../src/env-config/env-config.service";
import { AxiosHttpClient } from "../../src/shared/providers/http/implementation/axios-http-client";

export const hasApiKey = Boolean(process.env.NASA_API_KEY);

export const describeSmoke = hasApiKey ? describe : describe.skip;

export function smokeHttpClient(): AxiosHttpClient {
    return new AxiosHttpClient();
}

export function smokeEnvConfigService(): EnvConfigService {
    return { get: () => process.env.NASA_API_KEY ?? "DEMO_KEY" } as unknown as EnvConfigService;
}
