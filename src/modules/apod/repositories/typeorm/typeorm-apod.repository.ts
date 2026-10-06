import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, DeepPartial, Repository } from "typeorm";
import { BaseTypeOrmRepository } from "src/shared/infra/typeorm/repositories/base-typeorm.repository";
import { ApodEntity } from "../../entities/apod.entity";
import { IApodRepository } from "../apod-repository.interface";

@Injectable()
export class TypeOrmApodRepository extends BaseTypeOrmRepository<ApodEntity> implements IApodRepository {
    constructor(
        @InjectRepository(ApodEntity)
        apodRepository: Repository<ApodEntity>,
    ) {
        super(apodRepository);
    }

    async findByDate(date: string): Promise<ApodEntity | null> {
        return await this.repository.findOne({ where: { date } });
    }

    async findBetweenDates(startDate: string, endDate: string): Promise<ApodEntity[]> {
        return await this.repository.find({
            where: { date: Between(startDate, endDate) },
            order: { date: "ASC" },
        });
    }

    async countBetweenDates(startDate: string, endDate: string): Promise<number> {
        return await this.repository.count({
            where: { date: Between(startDate, endDate) },
        });
    }

    async upsertMany(apods: DeepPartial<ApodEntity>[]): Promise<void> {
        await this.upsertByNaturalKey(["date"], apods);
    }
}
