import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export const APOD_MAX_RANDOM_QUANTITY = 25;

export class ApodRandomQueryDto {
    @ApiPropertyOptional({
        description: "Quantidade de APODs aleatórios.",
        default: 1,
        minimum: 1,
        maximum: APOD_MAX_RANDOM_QUANTITY,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(APOD_MAX_RANDOM_QUANTITY)
    quantity?: number = 1;
}
