import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "src/shared/infra/typeorm/entities/base.entity";

import type { TechportProject } from "src/shared/providers/techport/models/techport-response.interface";

@Entity("techport_projects")
export class TechportProjectEntity extends BaseEntity {
    @Index("uq_techport_projects_project_id", { unique: true })
    @Column({ type: "int" })
    project_id: number;

    @Column({ type: "varchar", length: 1024, nullable: true })
    title: string | null;

    @Column({ type: "varchar", length: 64, nullable: true })
    status: string | null;

    @Index("idx_techport_projects_last_updated")
    @Column({ type: "date", nullable: true })
    last_updated: string | null;

    @Index("idx_techport_projects_payload", { synchronize: false })
    @Column({ type: "jsonb", nullable: true })
    payload: TechportProject | null;
}
