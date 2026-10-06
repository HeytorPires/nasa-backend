import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "src/shared/infra/typeorm/entities/base.entity";

@Entity("neo_feed_days")
export class NeoFeedDayEntity extends BaseEntity {
    @Index("uq_neo_feed_days_date", { unique: true })
    @Column({ type: "date" })
    date: string;

    @Index("idx_neo_feed_days_reference_ids", { synchronize: false })
    @Column({ type: "text", array: true, default: () => "'{}'" })
    neo_reference_ids: string[];

    @Column({ type: "int", default: 0 })
    element_count: number;
}
