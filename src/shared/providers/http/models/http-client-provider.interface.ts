export type HttpQueryParams = Record<string, string | number | boolean | undefined | null>;

export interface HttpRequestOptions {
    params?: HttpQueryParams;
    timeout?: number;
    retries?: number;
    headers?: Record<string, string>;
    context?: string;
}

export interface IHttpClientProvider {
    get<T>(url: string, options?: HttpRequestOptions): Promise<T>;
}
