import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from "class-validator";

export const EONET_STATUSES = ["open", "closed", "all"] as const;
export type EonetStatus = (typeof EONET_STATUSES)[number];

export class EonetEventsQueryDto {
    @ApiPropertyOptional({ enum: EONET_STATUSES, default: "open" })
    @IsOptional()
    @IsIn(EONET_STATUSES)
    status?: EonetStatus = "open";

    @ApiPropertyOptional({ description: "Id da categoria do EONET.", example: "wildfires" })
    @IsOptional()
    @IsString()
    @Matches(/^[a-zA-Z]+$/, { message: "category aceita apenas letras" })
    category?: string;

    @ApiPropertyOptional({ description: "Janela em dias a partir de hoje.", minimum: 1, maximum: 365 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(365)
    days?: number;

    @ApiPropertyOptional({ description: "Máximo de eventos.", default: 50, minimum: 1, maximum: 500 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(500)
    limit?: number = 50;
}
