import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, DeepPartial, In, Repository } from "typeorm";
import { BaseTypeOrmRepository } from "src/shared/infra/typeorm/repositories/base-typeorm.repository";
import { NeoFeedDayEntity } from "../../entities/neo-feed-day.entity";
import { NeoObjectEntity } from "../../entities/neo-object.entity";
import { INeoRepository } from "../neo-repository.interface";

@Injectable()
export class TypeOrmNeoRepository extends BaseTypeOrmRepository<NeoObjectEntity> implements INeoRepository {
    constructor(
        @InjectRepository(NeoObjectEntity)
        neoRepository: Repository<NeoObjectEntity>,
        @InjectRepository(NeoFeedDayEntity)
        private readonly feedDayRepository: Repository<NeoFeedDayEntity>,
    ) {
        super(neoRepository);
    }

    async findObjectByReferenceId(referenceId: string): Promise<NeoObjectEntity | null> {
        return await this.repository.findOne({ where: { neo_reference_id: referenceId } });
    }

    async findObjectsByReferenceIds(referenceIds: string[]): Promise<NeoObjectEntity[]> {
        if (referenceIds.length === 0) {
            return [];
        }

        return await this.repository.find({ where: { neo_reference_id: In(referenceIds) } });
    }

    async upsertObjects(objects: DeepPartial<NeoObjectEntity>[]): Promise<void> {
        await this.upsertByNaturalKey(["neo_reference_id"], objects);
    }

    async findFeedDays(startDate: string, endDate: string): Promise<NeoFeedDayEntity[]> {
        return await this.feedDayRepository.find({
            where: { date: Between(startDate, endDate) },
            order: { date: "ASC" },
        });
    }

    async upsertFeedDays(days: DeepPartial<NeoFeedDayEntity>[]): Promise<void> {
        if (days.length === 0) {
            return;
        }

        await this.feedDayRepository.upsert(days, {
            conflictPaths: ["date"],
            skipUpdateIfNoValuesChanged: true,
        });
    }
}
