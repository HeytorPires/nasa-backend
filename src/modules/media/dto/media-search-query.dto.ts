import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { MEDIA_TYPES } from "src/shared/providers/media/models/media-response.interface";

export class MediaSearchQueryDto {
    @ApiPropertyOptional({ description: "Termo de busca livre.", example: "apollo 11" })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    q?: string;

    @ApiPropertyOptional({ enum: MEDIA_TYPES })
    @IsOptional()
    @IsIn(MEDIA_TYPES)
    mediaType?: string;

    @ApiPropertyOptional({ description: "Ano inicial.", minimum: 1900, maximum: 2100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1900)
    @Max(2100)
    yearStart?: number;

    @ApiPropertyOptional({ description: "Ano final.", minimum: 1900, maximum: 2100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1900)
    @Max(2100)
    yearEnd?: number;

    @ApiPropertyOptional({ description: "Centro da NASA, ex.: JSC." })
    @IsOptional()
    @IsString()
    @MaxLength(64)
    center?: string;

    @ApiPropertyOptional({ description: "Palavras-chave separadas por vírgula." })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    keywords?: string;

    @ApiPropertyOptional({ description: "Página (base 1).", default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: "Itens por página.", default: 20, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    pageSize?: number = 20;
}
