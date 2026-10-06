import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsIn, IsISO8601, IsInt, IsOptional, Min } from "class-validator";
import { IsAfterOrEqual } from "src/shared/validators/is-after-or-equal.validator";
import { MaxDateRange } from "src/shared/validators/max-date-range.validator";

export const DONKI_MAX_RANGE_DAYS = 30;

export const DONKI_CME_CATALOGS = ["ALL", "SWRC_CATALOG", "JANG_ET_AL_CATALOG"] as const;
export const DONKI_IPS_LOCATIONS = ["ALL", "Earth", "MESSENGER", "STEREO A", "STEREO B"] as const;
export const DONKI_NOTIFICATION_TYPES = ["all", "FLR", "SEP", "CME", "IPS", "MPC", "GST", "RBE", "report"] as const;

export class DonkiQueryDto {
    @ApiPropertyOptional({ description: "Data inicial (YYYY-MM-DD). Padrão do upstream: 30 dias atrás." })
    @IsOptional()
    @IsISO8601({ strict: true }, { message: "startDate deve estar no formato YYYY-MM-DD" })
    startDate?: string;

    @ApiPropertyOptional({ description: "Data final (YYYY-MM-DD). Padrão do upstream: hoje." })
    @IsOptional()
    @IsISO8601({ strict: true }, { message: "endDate deve estar no formato YYYY-MM-DD" })
    @IsAfterOrEqual("startDate")
    @MaxDateRange("startDate", DONKI_MAX_RANGE_DAYS)
    endDate?: string;
}

export class DonkiCmeAnalysisQueryDto extends DonkiQueryDto {
    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    mostAccurateOnly?: boolean;

    @ApiPropertyOptional({ description: "Velocidade mínima (km/s).", minimum: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    speed?: number;

    @ApiPropertyOptional({ description: "Meio-ângulo mínimo (graus).", minimum: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    halfAngle?: number;

    @ApiPropertyOptional({ enum: DONKI_CME_CATALOGS, default: "ALL" })
    @IsOptional()
    @IsIn(DONKI_CME_CATALOGS)
    catalog?: string;
}

export class DonkiIpsQueryDto extends DonkiQueryDto {
    @ApiPropertyOptional({ enum: DONKI_IPS_LOCATIONS, default: "ALL" })
    @IsOptional()
    @IsIn(DONKI_IPS_LOCATIONS)
    location?: string;

    @ApiPropertyOptional({ description: "Catálogo de origem." })
    @IsOptional()
    @IsIn(["ALL", "SWRC_CATALOG", "WINSLOW_MESSENGER_ICME_CATALOG"])
    catalog?: string;
}

export class DonkiNotificationsQueryDto extends DonkiQueryDto {
    @ApiPropertyOptional({ enum: DONKI_NOTIFICATION_TYPES, default: "all" })
    @IsOptional()
    @IsIn(DONKI_NOTIFICATION_TYPES)
    type?: string;
}
