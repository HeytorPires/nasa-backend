import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { BaseTypeOrmRepository } from "src/shared/infra/typeorm/repositories/base-typeorm.repository";
import { MarsWeatherSolEntity } from "../../entities/mars-weather-sol.entity";
import { IMarsWeatherRepository } from "../mars-weather-repository.interface";

@Injectable()
export class TypeOrmMarsWeatherRepository
    extends BaseTypeOrmRepository<MarsWeatherSolEntity>
    implements IMarsWeatherRepository
{
    constructor(
        @InjectRepository(MarsWeatherSolEntity)
        marsWeatherRepository: Repository<MarsWeatherSolEntity>,
    ) {
        super(marsWeatherRepository);
    }

    async findLatest(limit: number): Promise<MarsWeatherSolEntity[]> {
        return await this.repository.find({ order: { sol: "DESC" }, take: limit });
    }

    async findBySol(sol: number): Promise<MarsWeatherSolEntity | null> {
        return await this.repository.findOne({ where: { sol } });
    }

    async upsertMany(sols: DeepPartial<MarsWeatherSolEntity>[]): Promise<void> {
        await this.upsertByNaturalKey(["sol"], sols);
    }
}
