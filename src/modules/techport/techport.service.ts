import { Inject, Injectable, Logger } from "@nestjs/common";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { ScheduledTask } from "src/shared/providers/scheduler/decorators/scheduled-task.decorator";
import { ITechportProvider } from "src/shared/providers/techport/models/techport-provider.interface";
import { CACHE_PROVIDER, TECHPORT_PROVIDER, TECHPORT_REPOSITORY } from "src/shared/tokens";
import { addDays, toIsoDate } from "src/shared/utils/date.util";
import { ITechportRepository } from "./repositories/techport-repository.interface";

import type { DeepPartial } from "typeorm";
import type {
    TechportProject,
    TechportProjectRef,
    TechportProjectsResponse,
} from "src/shared/providers/techport/models/techport-response.interface";
import type { TechportProjectEntity } from "./entities/techport-project.entity";

const CACHE_TTL_SECONDS = 60 * 60 * 24;
const DEFAULT_WINDOW_DAYS = 30;

@Injectable()
export class TechportService {
    private readonly logger = new Logger(TechportService.name);

    constructor(
        @Inject(TECHPORT_PROVIDER) private readonly techportProvider: ITechportProvider,
        @Inject(TECHPORT_REPOSITORY) private readonly techportRepository: ITechportRepository,
        @Inject(CACHE_PROVIDER) private readonly cacheProvider: ICacheProvider,
    ) {}

    async listProjects(updatedSince?: string): Promise<TechportProjectsResponse> {
        const since = updatedSince ?? toIsoDate(addDays(new Date(), -DEFAULT_WINDOW_DAYS));

        return await this.cacheProvider.getOrSet<TechportProjectsResponse>(
            `techport:projects:${since}`,
            CACHE_TTL_SECONDS,
            async () => {
                const response = await this.techportProvider.listProjects(since);
                await this.persistRefs(response.projects ?? []);

                return response;
            },
        );
    }

    async findProject(projectId: number): Promise<TechportProject> {
        return await this.cacheProvider.getOrSet<TechportProject>(
            `techport:project:${projectId}`,
            CACHE_TTL_SECONDS,
            async () => {
                const stored = await this.techportRepository.findByProjectId(projectId);

                if (stored?.payload) {
                    return stored.payload;
                }

                const project = await this.techportProvider.getProject(projectId);
                await this.techportRepository.upsertMany([this.toEntity(project)]);

                return project;
            },
        );
    }

    @ScheduledTask({ name: "techport:weekly", cron: "0 3 * * 0" })
    async syncRecentProjects(): Promise<void> {
        const lastUpdated = await this.techportRepository.findLastUpdatedDate();
        const since = lastUpdated ?? toIsoDate(addDays(new Date(), -DEFAULT_WINDOW_DAYS));

        try {
            const response = await this.techportProvider.listProjects(since);
            await this.persistRefs(response.projects ?? []);
            this.logger.log(`${response.projects?.length ?? 0} projeto(s) do TechPort atualizados desde ${since}.`);
        } catch (error) {
            this.logger.warn(`Falha ao sincronizar o TechPort: ${(error as Error).message}`);
        }
    }

    private async persistRefs(refs: TechportProjectRef[]): Promise<void> {
        if (refs.length === 0) {
            return;
        }

        await this.techportRepository.upsertMany(
            refs.map((ref) => ({
                project_id: ref.projectId,
                last_updated: this.normalizeDate(ref.lastUpdated),
            })),
        );
    }

    private toEntity(project: TechportProject): DeepPartial<TechportProjectEntity> {
        return {
            project_id: project.projectId,
            title: project.title ?? null,
            status: project.status ?? null,
            last_updated: this.normalizeDate(project.lastUpdated),
            payload: project,
        };
    }

    private normalizeDate(value?: string): string | null {
        if (!value) {
            return null;
        }

        const [year, month, day] = value.split("-");

        if (!year || !month || !day) {
            return null;
        }

        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
}
