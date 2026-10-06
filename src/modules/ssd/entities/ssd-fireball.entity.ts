import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "src/shared/infra/typeorm/entities/base.entity";

@Entity("ssd_fireballs")
@Index("uq_ssd_fireballs_observed_at_lat_lon", ["observed_at", "latitude", "longitude"], { unique: true })
export class SsdFireballEntity extends BaseEntity {
    @Index("idx_ssd_fireballs_observed_at")
    @Column({ type: "timestamptz" })
    observed_at: Date;

    @Column({ type: "double precision", nullable: true })
    latitude: number | null;

    @Column({ type: "double precision", nullable: true })
    longitude: number | null;

    @Column({ type: "double precision", nullable: true })
    impact_energy: number | null;

    @Column({ type: "jsonb" })
    payload: Record<string, string>;
}
