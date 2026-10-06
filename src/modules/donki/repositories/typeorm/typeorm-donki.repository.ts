import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { BaseTypeOrmRepository } from "src/shared/infra/typeorm/repositories/base-typeorm.repository";
import { DonkiEventEntity } from "../../entities/donki-event.entity";
import { IDonkiRepository } from "../donki-repository.interface";

@Injectable()
export class TypeOrmDonkiRepository extends BaseTypeOrmRepository<DonkiEventEntity> implements IDonkiRepository {
    constructor(
        @InjectRepository(DonkiEventEntity)
        donkiRepository: Repository<DonkiEventEntity>,
    ) {
        super(donkiRepository);
    }

    async findByTypeAndRange(eventType: string, startDate: string, endDate: string): Promise<DonkiEventEntity[]> {
        return await this.repository
            .createQueryBuilder("event")
            .where("event.event_type = :eventType", { eventType })
            .andWhere("event.event_time >= :startDate::date", { startDate })
            .andWhere("event.event_time < (:endDate::date + INTERVAL '1 day')", { endDate })
            .orderBy("event.event_time", "ASC")
            .getMany();
    }

    async upsertMany(events: DeepPartial<DonkiEventEntity>[]): Promise<void> {
        await this.upsertByNaturalKey(["event_type", "activity_id"], events);
    }
}
