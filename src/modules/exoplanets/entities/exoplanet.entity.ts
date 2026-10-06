import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "src/shared/infra/typeorm/entities/base.entity";

import type { ExoplanetRow } from "src/shared/providers/exoplanet/models/exoplanet-response.interface";

@Entity("exoplanets")
export class ExoplanetEntity extends BaseEntity {
    @Index("uq_exoplanets_pl_name", { unique: true })
    @Column({ type: "varchar", length: 128 })
    pl_name: string;

    @Index("idx_exoplanets_hostname")
    @Column({ type: "varchar", length: 128, nullable: true })
    hostname: string | null;

    @Index("idx_exoplanets_disc_year")
    @Column({ type: "int", nullable: true })
    disc_year: number | null;

    @Column({ type: "varchar", length: 64, nullable: true })
    discoverymethod: string | null;

    @Column({ type: "jsonb" })
    payload: ExoplanetRow;
}
