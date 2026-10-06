import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "src/shared/infra/typeorm/entities/base.entity";

import type { MarsSolSummary } from "src/shared/providers/mars-weather/models/mars-weather-response.interface";

@Entity("mars_weather_sols")
export class MarsWeatherSolEntity extends BaseEntity {
    @Index("uq_mars_weather_sols_sol", { unique: true })
    @Column({ type: "int" })
    sol: number;

    @Column({ type: "timestamptz", nullable: true })
    first_utc: Date | null;

    @Column({ type: "timestamptz", nullable: true })
    last_utc: Date | null;

    @Column({ type: "varchar", length: 32, nullable: true })
    season: string | null;

    @Column({ type: "double precision", nullable: true })
    average_temperature: number | null;

    @Column({ type: "jsonb" })
    payload: MarsSolSummary;
}
