import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { BaseTypeOrmRepository } from "src/shared/infra/typeorm/repositories/base-typeorm.repository";
import { addDays } from "src/shared/utils/date.util";
import { EonetEventEntity } from "../../entities/eonet-event.entity";
import { EonetEventFilters, IEonetRepository } from "../eonet-repository.interface";

@Injectable()
export class TypeOrmEonetRepository extends BaseTypeOrmRepository<EonetEventEntity> implements IEonetRepository {
    constructor(
        @InjectRepository(EonetEventEntity)
        eonetRepository: Repository<EonetEventEntity>,
    ) {
        super(eonetRepository);
    }

    async findEvents(filters: EonetEventFilters): Promise<EonetEventEntity[]> {
        const query = this.repository.createQueryBuilder("event");

        if (filters.status === "open") {
            query.andWhere("event.closed IS NULL");
        } else if (filters.status === "closed") {
            query.andWhere("event.closed IS NOT NULL");
        }

        if (filters.category) {
            query.andWhere("event.category_ids @> ARRAY[:category]::text[]", { category: filters.category });
        }

        if (filters.days) {
            query.andWhere("event.last_geometry_at >= :since", { since: addDays(new Date(), -filters.days) });
        }

        return await query.orderBy("event.last_geometry_at", "DESC", "NULLS LAST").limit(filters.limit).getMany();
    }

    async findByEonetId(eonetId: string): Promise<EonetEventEntity | null> {
        return await this.repository.findOne({ where: { eonet_id: eonetId } });
    }

    async upsertMany(events: DeepPartial<EonetEventEntity>[]): Promise<void> {
        await this.upsertByNaturalKey(["eonet_id"], events);
    }
}
