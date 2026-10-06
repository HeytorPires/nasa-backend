import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "src/shared/infra/typeorm/entities/base.entity";

import type { NeoObject } from "src/shared/providers/neo/models/neo-response.interface";

@Entity("neo_objects")
export class NeoObjectEntity extends BaseEntity {
    @Index("uq_neo_objects_reference_id", { unique: true })
    @Column({ type: "varchar", length: 32 })
    neo_reference_id: string;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Index("idx_neo_objects_hazardous")
    @Column({ type: "boolean", default: false })
    is_potentially_hazardous_asteroid: boolean;

    @Column({ type: "boolean", default: false })
    is_sentry_object: boolean;

    @Column({ type: "double precision", nullable: true })
    absolute_magnitude_h: number | null;

    @Column({ type: "jsonb" })
    payload: NeoObject;
}
