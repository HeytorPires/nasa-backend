import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "src/shared/infra/typeorm/entities/base.entity";

import type { EpicImage } from "src/shared/providers/epic/models/epic-response.interface";

@Entity("epic_images")
@Index("uq_epic_images_collection_identifier", ["collection", "identifier"], { unique: true })
export class EpicImageEntity extends BaseEntity {
    @Column({ type: "varchar", length: 32 })
    identifier: string;

    @Column({ type: "varchar", length: 16 })
    collection: string;

    @Index("idx_epic_images_captured_on")
    @Column({ type: "date" })
    captured_on: string;

    @Column({ type: "timestamptz" })
    captured_at: Date;

    @Column({ type: "varchar", length: 128 })
    image: string;

    @Column({ type: "text" })
    archive_url: string;

    @Column({ type: "jsonb" })
    payload: EpicImage;
}
