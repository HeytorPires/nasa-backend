import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "src/shared/infra/typeorm/entities/base.entity";

@Entity("ssd_sentry_objects")
export class SsdSentryObjectEntity extends BaseEntity {
    @Index("uq_ssd_sentry_objects_designation", { unique: true })
    @Column({ type: "varchar", length: 64 })
    designation: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    fullname: string | null;

    @Index("idx_ssd_sentry_objects_impact_probability")
    @Column({ type: "double precision", nullable: true })
    impact_probability: number | null;

    @Column({ type: "double precision", nullable: true })
    palermo_scale_cumulative: number | null;

    @Column({ type: "jsonb" })
    payload: Record<string, unknown>;
}
