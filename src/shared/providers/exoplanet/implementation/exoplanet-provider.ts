import { Inject, Injectable } from "@nestjs/common";
import { EnvConfigService } from "src/env-config/env-config.service";
import { UpstreamHttpProvider } from "src/shared/providers/base/upstream-http.provider";
import { HTTP_CLIENT_PROVIDER } from "src/shared/tokens";
import { EXOPLANET_COLUMNS, EXOPLANET_TABLE } from "../models/exoplanet-response.interface";

import type { IHttpClientProvider } from "src/shared/providers/http/models/http-client-provider.interface";
import type { IExoplanetProvider } from "../models/exoplanet-provider.interface";
import type { ExoplanetFilter, ExoplanetQuery, ExoplanetRow } from "../models/exoplanet-response.interface";

const OPERATORS: Record<ExoplanetFilter["operator"], string> = {
    eq: "=",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
    like: "like",
};

const MAX_ROWS = 500;

@Injectable()
export class ExoplanetProvider extends UpstreamHttpProvider implements IExoplanetProvider {
    protected readonly baseUrl = "https://exoplanetarchive.ipac.caltech.edu/TAP";
    protected readonly context = "NASA Exoplanet Archive";
    protected readonly requiresApiKey = false;

    constructor(@Inject(HTTP_CLIENT_PROVIDER) httpClient: IHttpClientProvider, envConfigService: EnvConfigService) {
        super(httpClient, envConfigService);
    }

    async query(query: ExoplanetQuery): Promise<ExoplanetRow[]> {
        const rows = await this.request<ExoplanetRow[]>(
            "/sync",
            { query: this.buildAdql(query), format: "json" },
            { timeout: 30_000 },
        );

        return Array.isArray(rows) ? rows : [];
    }

    private buildAdql(query: ExoplanetQuery): string {
        const limit = Math.min(Math.max(query.limit, 1), MAX_ROWS);
        const columns = EXOPLANET_COLUMNS.join(",");
        const where = query.filters.map((filter) => this.buildCondition(filter));
        const orderBy = this.buildOrderBy(query);

        return [
            `select top ${limit} ${columns} from ${EXOPLANET_TABLE}`,
            where.length > 0 ? `where ${where.join(" and ")}` : "",
            orderBy,
        ]
            .filter(Boolean)
            .join(" ");
    }

    private buildCondition(filter: ExoplanetFilter): string {
        if (!EXOPLANET_COLUMNS.includes(filter.column)) {
            throw new Error(`Coluna não permitida: ${filter.column}`);
        }

        const operator = OPERATORS[filter.operator];

        if (!operator) {
            throw new Error(`Operador não permitido: ${filter.operator}`);
        }

        return `${filter.column} ${operator} ${this.literal(filter.value)}`;
    }

    private buildOrderBy(query: ExoplanetQuery): string {
        if (!query.orderBy || !EXOPLANET_COLUMNS.includes(query.orderBy)) {
            return "";
        }

        return `order by ${query.orderBy} ${query.orderDirection === "desc" ? "desc" : "asc"}`;
    }

    private literal(value: string | number): string {
        if (typeof value === "number") {
            if (!Number.isFinite(value)) {
                throw new Error("Valor numérico inválido no filtro.");
            }
            return String(value);
        }

        return `'${value.replace(/'/g, "''")}'`;
    }
}
