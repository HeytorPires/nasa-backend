import type { DeepPartial } from "typeorm";
import { TechportProjectEntity } from "../entities/techport-project.entity";

export interface ITechportRepository {
    findByProjectId(projectId: number): Promise<TechportProjectEntity | null>;
    findLastUpdatedDate(): Promise<string | null>;
    upsertMany(projects: DeepPartial<TechportProjectEntity>[]): Promise<void>;
}
