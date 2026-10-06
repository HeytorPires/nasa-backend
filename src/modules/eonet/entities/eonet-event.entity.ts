import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "src/shared/infra/typeorm/entities/base.entity";

import type { EonetEvent } from "src/shared/providers/eonet/models/eonet-response.interface";

@Entity("eonet_events")
export class EonetEventEntity extends BaseEntity {
    @Index("uq_eonet_events_eonet_id", { unique: true })
    @Column({ type: "varchar", length: 64 })
    eonet_id: string;

    @Column({ type: "varchar", length: 512 })
    title: string;

    @Index("idx_eonet_events_closed")
    @Column({ type: "timestamptz", nullable: true })
    closed: Date | null;

    @Index("idx_eonet_events_categories", { synchronize: false })
    @Column({ type: "text", array: true, default: () => "'{}'" })
    category_ids: string[];

    @Index("idx_eonet_events_last_geometry_at")
    @Column({ type: "timestamptz", nullable: true })
    last_geometry_at: Date | null;

    @Column({ type: "jsonb" })
    payload: EonetEvent;
}
