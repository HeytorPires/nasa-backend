import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { BaseTypeOrmRepository } from "src/shared/infra/typeorm/repositories/base-typeorm.repository";
import { TechTransferItemEntity } from "../../entities/tech-transfer-item.entity";
import { ITechTransferRepository } from "../tech-transfer-repository.interface";

@Injectable()
export class TypeOrmTechTransferRepository
    extends BaseTypeOrmRepository<TechTransferItemEntity>
    implements ITechTransferRepository
{
    constructor(
        @InjectRepository(TechTransferItemEntity)
        techTransferRepository: Repository<TechTransferItemEntity>,
    ) {
        super(techTransferRepository);
    }

    async upsertMany(items: DeepPartial<TechTransferItemEntity>[]): Promise<void> {
        await this.upsertByNaturalKey(["category", "external_id"], items);
    }
}
