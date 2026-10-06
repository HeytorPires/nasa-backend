import { createServer, IncomingMessage, Server, ServerResponse } from "node:http";
import { AddressInfo } from "node:net";

export interface UpstreamRequest {
    path: string;
    query: Record<string, string>;
}

interface Route {
    path: string;
    status: number;
    body: unknown;
    statusSequence?: number[];
    delayMs?: number;
}

export class UpstreamServer {
    private server?: Server;
    private baseUrl = "";

    private readonly routes: Route[] = [];
    readonly requests: UpstreamRequest[] = [];

    get(path: string, body: unknown): this {
        this.routes.push({ path, status: 200, body });
        return this;
    }

    getWithStatus(path: string, status: number, body: unknown = {}): this {
        this.routes.push({ path, status, body });
        return this;
    }

    getWithStatusSequence(path: string, statuses: number[], body: unknown): this {
        this.routes.push({ path, status: 200, body, statusSequence: [...statuses] });
        return this;
    }

    getSlow(path: string, delayMs: number, body: unknown = {}): this {
        this.routes.push({ path, status: 200, body, delayMs });
        return this;
    }

    async start(): Promise<string> {
        this.server = createServer((request, response) => this.handle(request, response));

        await new Promise<void>((resolve) => this.server?.listen(0, "127.0.0.1", resolve));

        const { port } = this.server.address() as AddressInfo;
        this.baseUrl = `http://127.0.0.1:${port}`;

        return this.baseUrl;
    }

    async stop(): Promise<void> {
        if (!this.server) {
            return;
        }

        await new Promise<void>((resolve, reject) =>
            this.server?.close((error) => (error ? reject(error) : resolve())),
        );
        this.server = undefined;
    }

    get url(): string {
        return this.baseUrl;
    }

    requestsMatching(pathFragment: string): UpstreamRequest[] {
        return this.requests.filter((request) => request.path.includes(pathFragment));
    }

    reset(): void {
        this.routes.length = 0;
        this.requests.length = 0;
    }

    private handle(request: IncomingMessage, response: ServerResponse): void {
        const url = new URL(request.url ?? "/", this.baseUrl);
        const query = Object.fromEntries(url.searchParams.entries());

        this.requests.push({ path: url.pathname, query });

        const route = this.routes.find((candidate) => candidate.path === url.pathname);

        if (!route) {
            this.send(response, 404, { message: `Rota não registrada: ${url.pathname}` });
            return;
        }

        const status = route.statusSequence?.shift() ?? route.status;
        const body = status >= 400 ? { message: `status ${status}` } : route.body;

        if (route.delayMs) {
            setTimeout(() => this.send(response, status, body), route.delayMs);
            return;
        }

        this.send(response, status, body);
    }

    private send(response: ServerResponse, status: number, body: unknown): void {
        response.writeHead(status, { "content-type": "application/json" });
        response.end(JSON.stringify(body));
    }
}
