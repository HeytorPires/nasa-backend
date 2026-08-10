import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("apods")
export class ApodEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "date" })
    date: Date;

    @Column()
    explanation: string;

    @Column()
    media_type: string;

    @Column()
    service_version: string;

    @Column()
    title: string;

    @Column()
    url: string;

    @CreateDateColumn({ name: "created_at" })
    created_at: Date;
}
