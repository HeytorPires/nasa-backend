import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsISO8601, IsInt, IsNumber, IsOptional, Matches, Max, Min } from "class-validator";
import { IsAfterOrEqual } from "src/shared/validators/is-after-or-equal.validator";

export class SsdCloseApproachQueryDto {
    @ApiPropertyOptional({ description: "Data inicial (YYYY-MM-DD).", example: "2024-01-01" })
    @IsOptional()
    @IsISO8601({ strict: true }, { message: "dateMin deve estar no formato YYYY-MM-DD" })
    dateMin?: string;

    @ApiPropertyOptional({ description: "Data final (YYYY-MM-DD).", example: "2024-01-31" })
    @IsOptional()
    @IsISO8601({ strict: true }, { message: "dateMax deve estar no formato YYYY-MM-DD" })
    @IsAfterOrEqual("dateMin")
    dateMax?: string;

    @ApiPropertyOptional({ description: "Distância máxima em unidades astronômicas.", example: "0.05" })
    @IsOptional()
    @Matches(/^\d+(\.\d+)?$/, { message: "distMax deve ser um número em unidades astronômicas" })
    distMax?: string;

    @ApiPropertyOptional({ description: "Corpo central da aproximação.", example: "Earth" })
    @IsOptional()
    @Matches(/^[A-Za-z ]{1,32}$/, { message: "body aceita apenas letras" })
    body?: string;

    @ApiPropertyOptional({ description: "Máximo de linhas.", default: 100, minimum: 1, maximum: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(1000)
    limit?: number = 100;
}

export class SsdFireballQueryDto {
    @ApiPropertyOptional({ description: "Data inicial (YYYY-MM-DD)." })
    @IsOptional()
    @IsISO8601({ strict: true }, { message: "dateMin deve estar no formato YYYY-MM-DD" })
    dateMin?: string;

    @ApiPropertyOptional({ description: "Data final (YYYY-MM-DD)." })
    @IsOptional()
    @IsISO8601({ strict: true }, { message: "dateMax deve estar no formato YYYY-MM-DD" })
    @IsAfterOrEqual("dateMin")
    dateMax?: string;

    @ApiPropertyOptional({ description: "Máximo de linhas.", default: 100, minimum: 1, maximum: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(1000)
    limit?: number = 100;
}

export class SsdSentryQueryDto {
    @ApiPropertyOptional({ description: "Designação do objeto.", example: "1979 XB" })
    @IsOptional()
    @Matches(/^[A-Za-z0-9 ()._-]{1,64}$/, { message: "des contém caracteres inválidos" })
    des?: string;

    @ApiPropertyOptional({ description: "Probabilidade de impacto mínima.", example: 0.00001 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(1)
    ipMin?: number;

    @ApiPropertyOptional({ description: "Máximo de linhas.", default: 100, minimum: 1, maximum: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(1000)
    limit?: number = 100;
}

export const SSD_MISSION_DESIGN_CLASSES = ["all", "amor", "apollo", "aten", "ate", "ies", "phd"] as const;

export class SsdMissionDesignQueryDto {
    @ApiPropertyOptional({ description: "Designação do corpo alvo.", example: "2010 TK7" })
    @IsOptional()
    @Matches(/^[A-Za-z0-9 ()._-]{1,64}$/, { message: "des contém caracteres inválidos" })
    des?: string;

    @ApiPropertyOptional({ description: "Classe da missão.", enum: SSD_MISSION_DESIGN_CLASSES })
    @IsOptional()
    @IsIn(SSD_MISSION_DESIGN_CLASSES)
    class?: string;
}
