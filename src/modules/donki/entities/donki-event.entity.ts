import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "src/shared/infra/typeorm/entities/base.entity";

import type { DonkiEvent } from "src/shared/providers/donki/models/donki-response.interface";

@Entity("donki_events")
@Index("uq_donki_events_type_activity", ["event_type", "activity_id"], { unique: true })
export class DonkiEventEntity extends BaseEntity {
    @Column({ type: "varchar", length: 32 })
    event_type: string;

    @Column({ type: "varchar", length: 128 })
    activity_id: string;

    @Index("idx_donki_events_event_time")
    @Column({ type: "timestamptz", nullable: true })
    event_time: Date | null;

    @Column({ type: "jsonb" })
    payload: DonkiEvent;
}
