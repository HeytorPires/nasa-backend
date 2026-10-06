import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "src/shared/infra/typeorm/entities/base.entity";

@Entity("ssd_close_approaches")
@Index("uq_ssd_close_approaches_des_cd", ["designation", "close_approach_at"], { unique: true })
export class SsdCloseApproachEntity extends BaseEntity {
    @Column({ type: "varchar", length: 64 })
    designation: string;

    @Index("idx_ssd_close_approaches_at")
    @Column({ type: "timestamptz" })
    close_approach_at: Date;

    @Column({ type: "double precision", nullable: true })
    distance_au: number | null;

    @Column({ type: "double precision", nullable: true })
    relative_velocity_kms: number | null;

    @Column({ type: "jsonb" })
    payload: Record<string, string>;
}
