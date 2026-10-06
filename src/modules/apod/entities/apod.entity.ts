import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "src/shared/infra/typeorm/entities/base.entity";

@Entity("apods")
export class ApodEntity extends BaseEntity {
    @Index("uq_apods_date", { unique: true })
    @Column({ type: "date" })
    date: string;

    @Column({ type: "text" })
    explanation: string;

    @Column({ type: "varchar", length: 32 })
    media_type: string;

    @Column({ type: "varchar", length: 32, nullable: true })
    service_version: string | null;

    @Column({ type: "varchar", length: 512 })
    title: string;

    @Column({ type: "text" })
    url: string;

    @Column({ type: "text", nullable: true })
    hdurl: string | null;

    @Column({ type: "text", nullable: true })
    permalink: string | null;

    @Column({ type: "varchar", length: 512, nullable: true })
    copyright: string | null;

    @Column({ type: "text", nullable: true })
    alt: string | null;
}
