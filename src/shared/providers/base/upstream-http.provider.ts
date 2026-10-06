import { ENV_VARIABLE, EnvConfigService } from "src/env-config/env-config.service";
import { redactApiKey } from "src/shared/utils/sanitize.util";

import type {
    HttpQueryParams,
    HttpRequestOptions,
    IHttpClientProvider,
} from "src/shared/providers/http/models/http-client-provider.interface";

export abstract class UpstreamHttpProvider {
    protected abstract readonly baseUrl: string;

    protected abstract readonly context: string;

    protected readonly requiresApiKey: boolean = false;

    constructor(
        protected readonly httpClient: IHttpClientProvider,
        protected readonly envConfigService: EnvConfigService,
    ) {}

    protected async request<T>(
        path: string,
        params: HttpQueryParams = {},
        options: Omit<HttpRequestOptions, "params" | "context"> = {},
    ): Promise<T> {
        const finalParams: HttpQueryParams = this.requiresApiKey
            ? { api_key: this.envConfigService.get(ENV_VARIABLE.NASA_API_KEY), ...params }
            : params;

        const response = await this.httpClient.get<T>(`${this.baseUrl}${path}`, {
            ...options,
            params: finalParams,
            context: this.context,
        });

        return this.requiresApiKey ? redactApiKey(response) : response;
    }
}
