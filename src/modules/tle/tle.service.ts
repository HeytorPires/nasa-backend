import { Inject, Injectable, Logger } from "@nestjs/common";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { ScheduledTask } from "src/shared/providers/scheduler/decorators/scheduled-task.decorator";
import { ITleProvider } from "src/shared/providers/tle/models/tle-provider.interface";
import { CACHE_PROVIDER, TLE_PROVIDER, TLE_REPOSITORY } from "src/shared/tokens";
import { ITleRepository } from "./repositories/tle-repository.interface";

import type { DeepPartial } from "typeorm";
import type { TleCollection, TleRecord } from "src/shared/providers/tle/models/tle-response.interface";
import type { TleRecordEntity } from "./entities/tle-record.entity";

const CACHE_TTL_SECONDS = 60 * 60 * 6;
const TRACKED_SATELLITES_LIMIT = 50;

@Injectable()
export class TleService {
    private readonly logger = new Logger(TleService.name);

    constructor(
        @Inject(TLE_PROVIDER) private readonly tleProvider: ITleProvider,
        @Inject(TLE_REPOSITORY) private readonly tleRepository: ITleRepository,
        @Inject(CACHE_PROVIDER) private readonly cacheProvider: ICacheProvider,
    ) {}

    async search(search: string | undefined, page: number, pageSize: number): Promise<TleCollection> {
        return await this.cacheProvider.getOrSet<TleCollection>(
            `tle:search:${search ?? "all"}:${page}:${pageSize}`,
            CACHE_TTL_SECONDS,
            async () => {
                const collection = await this.tleProvider.search(search, page, pageSize);
                await this.persist(collection.member ?? []);

                return collection;
            },
        );
    }

    async findBySatelliteId(satelliteId: number): Promise<TleRecord> {
        return await this.cacheProvider.getOrSet<TleRecord>(
            `tle:satellite:${satelliteId}`,
            CACHE_TTL_SECONDS,
            async () => {
                const record = await this.tleProvider.getBySatelliteId(satelliteId);
                await this.persist([record]);

                return record;
            },
        );
    }

    @ScheduledTask({ name: "tle:daily", cron: "0 4 * * *" })
    async syncTrackedSatellites(): Promise<void> {
        const satelliteIds = await this.tleRepository.findTrackedSatelliteIds(TRACKED_SATELLITES_LIMIT);

        if (satelliteIds.length === 0) {
            this.logger.log("Nenhum satélite acompanhado ainda; nada a sincronizar.");
            return;
        }

        let updated = 0;

        for (const satelliteId of satelliteIds) {
            try {
                const record = await this.tleProvider.getBySatelliteId(satelliteId);
                await this.persist([record]);
                updated++;
            } catch (error) {
                this.logger.warn(`Falha ao atualizar o TLE do satélite ${satelliteId}: ${(error as Error).message}`);
            }
        }

        this.logger.log(`${updated}/${satelliteIds.length} TLE(s) atualizado(s).`);
    }

    private async persist(records: TleRecord[]): Promise<void> {
        if (records.length === 0) {
            return;
        }

        await this.tleRepository.upsertMany(records.map((record) => this.toEntity(record)));
    }

    private toEntity(record: TleRecord): DeepPartial<TleRecordEntity> {
        return {
            satellite_id: record.satelliteId,
            name: record.name,
            epoch: new Date(record.date),
            line1: record.line1,
            line2: record.line2,
        };
    }
}
