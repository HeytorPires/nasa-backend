import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "src/shared/infra/typeorm/entities/base.entity";

@Entity("tle_records")
@Index("uq_tle_records_satellite_epoch", ["satellite_id", "epoch"], { unique: true })
export class TleRecordEntity extends BaseEntity {
    @Index("idx_tle_records_satellite_id")
    @Column({ type: "int" })
    satellite_id: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "timestamptz" })
    epoch: Date;

    @Column({ type: "varchar", length: 128 })
    line1: string;

    @Column({ type: "varchar", length: 128 })
    line2: string;
}
