import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "src/shared/infra/typeorm/entities/base.entity";

@Entity("tech_transfer_items")
@Index("uq_tech_transfer_items_category_external_id", ["category", "external_id"], { unique: true })
export class TechTransferItemEntity extends BaseEntity {
    @Column({ type: "varchar", length: 32 })
    category: string;

    @Column({ type: "varchar", length: 64 })
    external_id: string;

    @Column({ type: "varchar", length: 64, nullable: true })
    case_number: string | null;

    @Column({ type: "varchar", length: 1024 })
    title: string;

    @Column({ type: "text", nullable: true })
    description: string | null;

    @Column({ type: "varchar", length: 64, nullable: true })
    center: string | null;

    @Column({ type: "jsonb" })
    payload: Record<string, unknown>;
}
