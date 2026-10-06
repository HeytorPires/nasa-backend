import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { BaseTypeOrmRepository } from "src/shared/infra/typeorm/repositories/base-typeorm.repository";
import { TleRecordEntity } from "../../entities/tle-record.entity";
import { ITleRepository } from "../tle-repository.interface";

@Injectable()
export class TypeOrmTleRepository extends BaseTypeOrmRepository<TleRecordEntity> implements ITleRepository {
    constructor(
        @InjectRepository(TleRecordEntity)
        tleRepository: Repository<TleRecordEntity>,
    ) {
        super(tleRepository);
    }

    async findLatestBySatelliteId(satelliteId: number): Promise<TleRecordEntity | null> {
        return await this.repository.findOne({
            where: { satellite_id: satelliteId },
            order: { epoch: "DESC" },
        });
    }

    async findTrackedSatelliteIds(limit: number): Promise<number[]> {
        const rows = await this.repository
            .createQueryBuilder("record")
            .select("record.satellite_id", "satellite_id")
            .groupBy("record.satellite_id")
            .orderBy("MAX(record.epoch)", "DESC")
            .limit(limit)
            .getRawMany<{ satellite_id: number }>();

        return rows.map((row) => Number(row.satellite_id));
    }

    async upsertMany(records: DeepPartial<TleRecordEntity>[]): Promise<void> {
        await this.upsertByNaturalKey(["satellite_id", "epoch"], records);
    }
}
