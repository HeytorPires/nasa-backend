import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { BaseTypeOrmRepository } from "src/shared/infra/typeorm/repositories/base-typeorm.repository";
import { ExoplanetEntity } from "../../entities/exoplanet.entity";
import { IExoplanetRepository } from "../exoplanet-repository.interface";

@Injectable()
export class TypeOrmExoplanetRepository extends BaseTypeOrmRepository<ExoplanetEntity> implements IExoplanetRepository {
    constructor(
        @InjectRepository(ExoplanetEntity)
        exoplanetRepository: Repository<ExoplanetEntity>,
    ) {
        super(exoplanetRepository);
    }

    async findByName(plName: string): Promise<ExoplanetEntity | null> {
        return await this.repository.findOne({ where: { pl_name: plName } });
    }

    async upsertMany(planets: DeepPartial<ExoplanetEntity>[]): Promise<void> {
        await this.upsertByNaturalKey(["pl_name"], planets);
    }
}
