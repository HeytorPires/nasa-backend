import { Inject, Injectable, Logger } from "@nestjs/common";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { IExoplanetProvider } from "src/shared/providers/exoplanet/models/exoplanet-provider.interface";
import { ScheduledTask } from "src/shared/providers/scheduler/decorators/scheduled-task.decorator";
import { CACHE_PROVIDER, EXOPLANET_PROVIDER, EXOPLANET_REPOSITORY } from "src/shared/tokens";
import { ExoplanetQueryDto } from "./dto/exoplanet-query.dto";
import { IExoplanetRepository } from "./repositories/exoplanet-repository.interface";

import type { DeepPartial } from "typeorm";
import type { ExoplanetFilter, ExoplanetRow } from "src/shared/providers/exoplanet/models/exoplanet-response.interface";
import type { ExoplanetEntity } from "./entities/exoplanet.entity";

const CACHE_TTL_SECONDS = 60 * 60 * 24;
const SYNC_LIMIT = 500;

@Injectable()
export class ExoplanetsService {
    private readonly logger = new Logger(ExoplanetsService.name);

    constructor(
        @Inject(EXOPLANET_PROVIDER) private readonly exoplanetProvider: IExoplanetProvider,
        @Inject(EXOPLANET_REPOSITORY) private readonly exoplanetRepository: IExoplanetRepository,
        @Inject(CACHE_PROVIDER) private readonly cacheProvider: ICacheProvider,
    ) {}

    async find(query: ExoplanetQueryDto): Promise<ExoplanetRow[]> {
        return await this.cacheProvider.getOrSet<ExoplanetRow[]>(
            `exoplanets:${JSON.stringify(query)}`,
            CACHE_TTL_SECONDS,
            async () => {
                const rows = await this.exoplanetProvider.query({
                    filters: this.toFilters(query),
                    limit: query.limit ?? 50,
                    orderBy: query.orderBy,
                    orderDirection: query.orderDirection,
                });

                await this.persist(rows);

                return rows;
            },
        );
    }

    @ScheduledTask({ name: "exoplanets:weekly", cron: "0 2 * * 0" })
    async syncRecentDiscoveries(): Promise<void> {
        try {
            const rows = await this.exoplanetProvider.query({
                filters: [],
                limit: SYNC_LIMIT,
                orderBy: "disc_year",
                orderDirection: "desc",
            });

            await this.persist(rows);
            this.logger.log(`${rows.length} exoplaneta(s) sincronizado(s).`);
        } catch (error) {
            this.logger.warn(`Falha ao sincronizar exoplanetas: ${(error as Error).message}`);
        }
    }

    private toFilters(query: ExoplanetQueryDto): ExoplanetFilter[] {
        const filters: ExoplanetFilter[] = [];

        if (query.plName) {
            filters.push({ column: "pl_name", operator: "eq", value: query.plName });
        }

        if (query.hostname) {
            filters.push({ column: "hostname", operator: "eq", value: query.hostname });
        }

        if (query.discYear !== undefined) {
            filters.push({ column: "disc_year", operator: "eq", value: query.discYear });
        }

        if (query.discoveryMethod) {
            filters.push({ column: "discoverymethod", operator: "eq", value: query.discoveryMethod });
        }

        if (query.minRadiusEarth !== undefined) {
            filters.push({ column: "pl_rade", operator: "gte", value: query.minRadiusEarth });
        }

        if (query.maxRadiusEarth !== undefined) {
            filters.push({ column: "pl_rade", operator: "lte", value: query.maxRadiusEarth });
        }

        if (query.maxDistanceParsec !== undefined) {
            filters.push({ column: "sy_dist", operator: "lte", value: query.maxDistanceParsec });
        }

        return filters;
    }

    private async persist(rows: ExoplanetRow[]): Promise<void> {
        const entities = rows
            .filter((row) => typeof row.pl_name === "string" && row.pl_name.length > 0)
            .map((row) => this.toEntity(row));

        if (entities.length === 0) {
            return;
        }

        await this.exoplanetRepository.upsertMany(entities);
    }

    private toEntity(row: ExoplanetRow): DeepPartial<ExoplanetEntity> {
        return {
            pl_name: row.pl_name,
            hostname: typeof row.hostname === "string" ? row.hostname : null,
            disc_year: typeof row.disc_year === "number" ? row.disc_year : null,
            discoverymethod: typeof row.discoverymethod === "string" ? row.discoverymethod : null,
            payload: row,
        };
    }
}
