import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { BaseTypeOrmRepository } from "src/shared/infra/typeorm/repositories/base-typeorm.repository";
import { EpicImageEntity } from "../../entities/epic-image.entity";
import { IEpicRepository } from "../epic-repository.interface";

@Injectable()
export class TypeOrmEpicRepository extends BaseTypeOrmRepository<EpicImageEntity> implements IEpicRepository {
    constructor(
        @InjectRepository(EpicImageEntity)
        epicRepository: Repository<EpicImageEntity>,
    ) {
        super(epicRepository);
    }

    async findByDate(collection: string, date: string): Promise<EpicImageEntity[]> {
        return await this.repository.find({
            where: { collection, captured_on: date },
            order: { captured_at: "ASC" },
        });
    }

    async findLatestDate(collection: string): Promise<string | null> {
        const latest = await this.repository.findOne({
            where: { collection },
            order: { captured_on: "DESC" },
        });

        return latest?.captured_on ?? null;
    }

    async findAvailableDates(collection: string): Promise<string[]> {
        const rows = await this.repository
            .createQueryBuilder("image")
            .select("TO_CHAR(image.captured_on, 'YYYY-MM-DD')", "captured_on")
            .where("image.collection = :collection", { collection })
            .groupBy("image.captured_on")
            .orderBy("image.captured_on", "DESC")
            .getRawMany<{ captured_on: string }>();

        return rows.map((row) => row.captured_on);
    }

    async upsertMany(images: DeepPartial<EpicImageEntity>[]): Promise<void> {
        await this.upsertByNaturalKey(["collection", "identifier"], images);
    }
}
