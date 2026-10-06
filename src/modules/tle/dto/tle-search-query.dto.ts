import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, MaxLength, Min, Max } from "class-validator";

export class TleSearchQueryDto {
    @ApiPropertyOptional({ description: "Trecho do nome do satélite.", example: "iss" })
    @IsOptional()
    @IsString()
    @MaxLength(128)
    search?: string;

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
