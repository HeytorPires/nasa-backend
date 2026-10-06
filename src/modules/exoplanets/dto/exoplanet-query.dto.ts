import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { EXOPLANET_COLUMNS, ExoplanetColumn } from "src/shared/providers/exoplanet/models/exoplanet-response.interface";

export class ExoplanetQueryDto {
    @ApiPropertyOptional({ description: "Nome exato do planeta.", example: "HD 2039 b" })
    @IsOptional()
    @IsString()
    @MaxLength(128)
    plName?: string;

    @ApiPropertyOptional({ description: "Nome da estrela hospedeira.", example: "HD 2039" })
    @IsOptional()
    @IsString()
    @MaxLength(128)
    hostname?: string;

    @ApiPropertyOptional({ description: "Ano da descoberta.", minimum: 1990, maximum: 2100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1990)
    @Max(2100)
    discYear?: number;

    @ApiPropertyOptional({ description: "Método de descoberta.", example: "Transit" })
    @IsOptional()
    @IsString()
    @MaxLength(64)
    discoveryMethod?: string;

    @ApiPropertyOptional({ description: "Raio mínimo em raios terrestres." })
    @IsOptional()
    @Type(() => Number)
    @Min(0)
    minRadiusEarth?: number;

    @ApiPropertyOptional({ description: "Raio máximo em raios terrestres." })
    @IsOptional()
    @Type(() => Number)
    @Min(0)
    maxRadiusEarth?: number;

    @ApiPropertyOptional({ description: "Distância máxima do sistema em parsecs." })
    @IsOptional()
    @Type(() => Number)
    @Min(0)
    maxDistanceParsec?: number;

    @ApiPropertyOptional({ enum: EXOPLANET_COLUMNS, description: "Coluna de ordenação." })
    @IsOptional()
    @IsIn(EXOPLANET_COLUMNS)
    orderBy?: ExoplanetColumn;

    @ApiPropertyOptional({ enum: ["asc", "desc"], default: "asc" })
    @IsOptional()
    @IsIn(["asc", "desc"])
    orderDirection?: "asc" | "desc";

    @ApiPropertyOptional({ description: "Máximo de linhas.", default: 50, minimum: 1, maximum: 500 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(500)
    limit?: number = 50;
}
