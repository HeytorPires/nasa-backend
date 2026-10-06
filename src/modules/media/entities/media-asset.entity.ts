import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "src/shared/infra/typeorm/entities/base.entity";

import type { MediaItem } from "src/shared/providers/media/models/media-response.interface";

@Entity("media_assets")
export class MediaAssetEntity extends BaseEntity {
    @Index("uq_media_assets_nasa_id", { unique: true })
    @Column({ type: "varchar", length: 255 })
    nasa_id: string;

    @Column({ type: "varchar", length: 1024 })
    title: string;

    @Index("idx_media_assets_media_type")
    @Column({ type: "varchar", length: 32 })
    media_type: string;

    @Index("idx_media_assets_date_created")
    @Column({ type: "timestamptz", nullable: true })
    date_created: Date | null;

    @Column({ type: "varchar", length: 128, nullable: true })
    center: string | null;

    @Index("idx_media_assets_keywords", { synchronize: false })
    @Column({ type: "text", array: true, default: () => "'{}'" })
    keywords: string[];

    @Index("idx_media_assets_payload", { synchronize: false })
    @Column({ type: "jsonb" })
    payload: MediaItem;
}
