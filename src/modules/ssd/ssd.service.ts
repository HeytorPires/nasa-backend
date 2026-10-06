import { Inject, Injectable, Logger } from "@nestjs/common";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { ScheduledTask } from "src/shared/providers/scheduler/decorators/scheduled-task.decorator";
import { ISsdProvider } from "src/shared/providers/ssd/models/ssd-provider.interface";
import { CACHE_PROVIDER, SSD_PROVIDER, SSD_REPOSITORY } from "src/shared/tokens";
import { addDays, toIsoDate } from "src/shared/utils/date.util";
import { ISsdRepository } from "./repositories/ssd-repository.interface";

import type {
    SsdCadQuery,
    SsdFireballQuery,
    SsdSentryQuery,
    SsdSentryResponse,
    SsdTableResponse,
} from "src/shared/providers/ssd/models/ssd-response.interface";

const CACHE_TTL_SECONDS = 60 * 60 * 3;
const VOLATILE_CACHE_TTL_SECONDS = 60 * 5;

@Injectable()
export class SsdService {
    private readonly logger = new Logger(SsdService.name);

    constructor(
        @Inject(SSD_PROVIDER) private readonly ssdProvider: ISsdProvider,
        @Inject(SSD_REPOSITORY) private readonly ssdRepository: ISsdRepository,
        @Inject(CACHE_PROVIDER) private readonly cacheProvider: ICacheProvider,
    ) {}

    async findCloseApproaches(query: SsdCadQuery): Promise<SsdTableResponse> {
        return await this.cacheProvider.getOrSet<SsdTableResponse>(
            `ssd:cad:${JSON.stringify(query)}`,
            CACHE_TTL_SECONDS,
            async () => {
                const response = await this.ssdProvider.getCloseApproaches(query);
                await this.persistCloseApproaches(response);

                return response;
            },
        );
    }

    async findFireballs(query: SsdFireballQuery): Promise<SsdTableResponse> {
        return await this.cacheProvider.getOrSet<SsdTableResponse>(
            `ssd:fireball:${JSON.stringify(query)}`,
            CACHE_TTL_SECONDS,
            async () => {
                const response = await this.ssdProvider.getFireballs(query);
                await this.persistFireballs(response);

                return response;
            },
        );
    }

    async findSentry(query: SsdSentryQuery): Promise<SsdSentryResponse> {
        return await this.cacheProvider.getOrSet<SsdSentryResponse>(
            `ssd:sentry:${JSON.stringify(query)}`,
            CACHE_TTL_SECONDS,
            async () => {
                const response = await this.ssdProvider.getSentry(query);
                await this.persistSentry(response);

                return response;
            },
        );
    }

    async findNhats(): Promise<SsdTableResponse> {
        return await this.cacheProvider.getOrSet("ssd:nhats", CACHE_TTL_SECONDS, () => this.ssdProvider.getNhats());
    }

    async findScout(): Promise<unknown> {
        return await this.cacheProvider.getOrSet("ssd:scout", VOLATILE_CACHE_TTL_SECONDS, () =>
            this.ssdProvider.getScout(),
        );
    }

    async findMissionDesign(params: Record<string, string | number>): Promise<unknown> {
        return await this.cacheProvider.getOrSet(
            `ssd:mdesign:${JSON.stringify(params)}`,
            VOLATILE_CACHE_TTL_SECONDS,
            () => this.ssdProvider.getMissionDesign(params),
        );
    }

    @ScheduledTask({ name: "ssd:daily", cron: "0 3 * * *" })
    async syncDailyData(): Promise<void> {
        const dateMin = toIsoDate(addDays(new Date(), -1));
        const dateMax = toIsoDate(addDays(new Date(), 60));

        try {
            const approaches = await this.ssdProvider.getCloseApproaches({ dateMin, dateMax, distMax: "0.05" });
            await this.persistCloseApproaches(approaches);
            this.logger.log(`${approaches.data?.length ?? 0} aproximação(ões) do CAD sincronizada(s).`);
        } catch (error) {
            this.logger.warn(`Falha ao sincronizar o CAD: ${(error as Error).message}`);
        }

        try {
            const fireballs = await this.ssdProvider.getFireballs({ dateMin: toIsoDate(addDays(new Date(), -30)) });
            await this.persistFireballs(fireballs);
            this.logger.log(`${fireballs.data?.length ?? 0} bola(s) de fogo sincronizada(s).`);
        } catch (error) {
            this.logger.warn(`Falha ao sincronizar os fireballs: ${(error as Error).message}`);
        }
    }

    private async persistCloseApproaches(response: SsdTableResponse): Promise<void> {
        const rows = this.toRecords(response);

        await this.ssdRepository.upsertCloseApproaches(
            rows
                .filter((row) => row.des && row.cd)
                .map((row) => ({
                    designation: row.des,
                    close_approach_at: new Date(`${row.cd} UTC`),
                    distance_au: this.toNumber(row.dist),
                    relative_velocity_kms: this.toNumber(row.v_rel),
                    payload: row,
                })),
        );
    }

    private async persistFireballs(response: SsdTableResponse): Promise<void> {
        const rows = this.toRecords(response);

        await this.ssdRepository.upsertFireballs(
            rows
                .filter((row) => row.date)
                .map((row) => ({
                    observed_at: new Date(`${row.date} UTC`),
                    latitude: this.toSignedCoordinate(row.lat, row["lat-dir"], "S"),
                    longitude: this.toSignedCoordinate(row.lon, row["lon-dir"], "W"),
                    impact_energy: this.toNumber(row["impact-e"]),
                    payload: row,
                })),
        );
    }

    private async persistSentry(response: SsdSentryResponse): Promise<void> {
        const rows = (response.data ?? []).filter((row) => typeof row.des === "string");

        await this.ssdRepository.upsertSentryObjects(
            rows.map((row) => ({
                designation: row.des as string,
                fullname: typeof row.fullname === "string" ? row.fullname : null,
                impact_probability: this.toNumber(row.ip),
                palermo_scale_cumulative: this.toNumber(row.ps_cum),
                payload: row,
            })),
        );
    }

    private toRecords(response: SsdTableResponse): Record<string, string>[] {
        const fields = response?.fields ?? [];
        const data = response?.data ?? [];

        return data.map((row) => Object.fromEntries(fields.map((field, index) => [field, row[index]])));
    }

    private toNumber(value: unknown): number | null {
        if (value === null || value === undefined || value === "") {
            return null;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    private toSignedCoordinate(value: unknown, direction: unknown, negativeDirection: string): number | null {
        const magnitude = this.toNumber(value);

        if (magnitude === null) {
            return null;
        }

        return direction === negativeDirection ? -magnitude : magnitude;
    }
}
