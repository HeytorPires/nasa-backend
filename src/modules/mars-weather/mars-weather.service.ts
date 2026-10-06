import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { IMarsWeatherProvider } from "src/shared/providers/mars-weather/models/mars-weather-provider.interface";
import { ScheduledTask } from "src/shared/providers/scheduler/decorators/scheduled-task.decorator";
import { CACHE_PROVIDER, MARS_WEATHER_PROVIDER, MARS_WEATHER_REPOSITORY } from "src/shared/tokens";
import { IMarsWeatherRepository } from "./repositories/mars-weather-repository.interface";

import type { DeepPartial } from "typeorm";
import type {
    MarsSolSummary,
    MarsWeatherResponse,
} from "src/shared/providers/mars-weather/models/mars-weather-response.interface";
import type { MarsWeatherSolEntity } from "./entities/mars-weather-sol.entity";

const CACHE_TTL_SECONDS = 60 * 60;

const UPSTREAM_SOL_WINDOW = 7;

export interface MarsSolDto extends MarsSolSummary {
    sol: number;
}

@Injectable()
export class MarsWeatherService {
    private readonly logger = new Logger(MarsWeatherService.name);

    constructor(
        @Inject(MARS_WEATHER_PROVIDER) private readonly marsWeatherProvider: IMarsWeatherProvider,
        @Inject(MARS_WEATHER_REPOSITORY) private readonly marsWeatherRepository: IMarsWeatherRepository,
        @Inject(CACHE_PROVIDER) private readonly cacheProvider: ICacheProvider,
    ) {}

    async findLatest(): Promise<MarsSolDto[]> {
        return await this.cacheProvider.getOrSet<MarsSolDto[]>("mars-weather:latest", CACHE_TTL_SECONDS, async () => {
            const sols = await this.fetchAndPersist();

            if (sols.length > 0) {
                return sols;
            }

            const stored = await this.marsWeatherRepository.findLatest(UPSTREAM_SOL_WINDOW);
            return stored.map((entity) => ({ sol: entity.sol, ...entity.payload }));
        });
    }

    async findBySol(sol: number): Promise<MarsSolDto> {
        const stored = await this.marsWeatherRepository.findBySol(sol);

        if (stored) {
            return { sol: stored.sol, ...stored.payload };
        }

        const fresh = await this.fetchAndPersist();
        const match = fresh.find((entry) => entry.sol === sol);

        if (!match) {
            throw new NotFoundException(`Nenhum dado meteorológico disponível para o sol ${sol}.`);
        }

        return match;
    }

    @ScheduledTask({ name: "mars-weather:daily", cron: "0 9 * * *" })
    async syncLatest(): Promise<void> {
        try {
            const sols = await this.fetchAndPersist();
            this.logger.log(`${sols.length} sol(s) do InSight sincronizado(s).`);
        } catch (error) {
            this.logger.warn(`Falha ao sincronizar o InSight: ${(error as Error).message}`);
        }
    }

    private async fetchAndPersist(): Promise<MarsSolDto[]> {
        const response = await this.marsWeatherProvider.getLatest();
        const sols = this.extractSols(response);

        if (sols.length > 0) {
            await this.marsWeatherRepository.upsertMany(sols.map((sol) => this.toEntity(sol)));
        }

        return sols;
    }

    private extractSols(response: MarsWeatherResponse): MarsSolDto[] {
        const solKeys = Array.isArray(response?.sol_keys) ? response.sol_keys : [];

        return solKeys
            .map((key) => {
                const summary = response[key] as MarsSolSummary | undefined;
                return summary ? { sol: Number(key), ...summary } : null;
            })
            .filter((entry): entry is MarsSolDto => entry !== null)
            .sort((a, b) => b.sol - a.sol);
    }

    private toEntity(sol: MarsSolDto): DeepPartial<MarsWeatherSolEntity> {
        const { sol: solNumber, ...summary } = sol;

        return {
            sol: solNumber,
            first_utc: summary.First_UTC ? new Date(summary.First_UTC) : null,
            last_utc: summary.Last_UTC ? new Date(summary.Last_UTC) : null,
            season: summary.Season ?? null,
            average_temperature: summary.AT?.av ?? null,
            payload: summary,
        };
    }
}
