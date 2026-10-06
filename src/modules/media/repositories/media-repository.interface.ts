import type { DeepPartial } from "typeorm";
import { MediaAssetEntity } from "../entities/media-asset.entity";

export interface IMediaRepository {
    findByNasaId(nasaId: string): Promise<MediaAssetEntity | null>;
    upsertMany(assets: DeepPartial<MediaAssetEntity>[]): Promise<void>;
}
