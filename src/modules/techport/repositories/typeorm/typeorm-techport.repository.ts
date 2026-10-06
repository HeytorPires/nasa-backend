import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { BaseTypeOrmRepository } from "src/shared/infra/typeorm/repositories/base-typeorm.repository";
import { TechportProjectEntity } from "../../entities/techport-project.entity";
import { ITechportRepository } from "../techport-repository.interface";

@Injectable()
export class TypeOrmTechportRepository
    extends BaseTypeOrmRepository<TechportProjectEntity>
    implements ITechportRepository
{
    constructor(
        @InjectRepository(TechportProjectEntity)
        techportRepository: Repository<TechportProjectEntity>,
    ) {
        super(techportRepository);
    }

    async findByProjectId(projectId: number): Promise<TechportProjectEntity | null> {
        return await this.repository.findOne({ where: { project_id: projectId } });
    }

    async findLastUpdatedDate(): Promise<string | null> {
        const latest = await this.repository.findOne({
            where: {},
            order: { last_updated: "DESC" },
        });

        return latest?.last_updated ?? null;
    }

    async upsertMany(projects: DeepPartial<TechportProjectEntity>[]): Promise<void> {
        await this.upsertByNaturalKey(["project_id"], projects);
    }
}
