import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { BaseTypeOrmRepository } from "src/shared/infra/typeorm/repositories/base-typeorm.repository";
import { MediaAssetEntity } from "../../entities/media-asset.entity";
import { IMediaRepository } from "../media-repository.interface";

@Injectable()
export class TypeOrmMediaRepository extends BaseTypeOrmRepository<MediaAssetEntity> implements IMediaRepository {
    constructor(
        @InjectRepository(MediaAssetEntity)
        mediaRepository: Repository<MediaAssetEntity>,
    ) {
        super(mediaRepository);
    }

    async findByNasaId(nasaId: string): Promise<MediaAssetEntity | null> {
        return await this.repository.findOne({ where: { nasa_id: nasaId } });
    }

    async upsertMany(assets: DeepPartial<MediaAssetEntity>[]): Promise<void> {
        await this.upsertByNaturalKey(["nasa_id"], assets);
    }
}
