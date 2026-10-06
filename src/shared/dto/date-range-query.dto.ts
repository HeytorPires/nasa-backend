import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsISO8601, IsOptional } from "class-validator";
import { IsAfterOrEqual } from "src/shared/validators/is-after-or-equal.validator";
import { MaxDateRange } from "src/shared/validators/max-date-range.validator";

export class DateRangeQueryDto {
    @ApiPropertyOptional({ description: "Data inicial (YYYY-MM-DD).", example: "2024-05-01" })
    @IsOptional()
    @IsISO8601({ strict: true }, { message: "startDate deve estar no formato YYYY-MM-DD" })
    startDate?: string;

    @ApiPropertyOptional({ description: "Data final (YYYY-MM-DD).", example: "2024-05-10" })
    @IsOptional()
    @IsISO8601({ strict: true }, { message: "endDate deve estar no formato YYYY-MM-DD" })
    @IsAfterOrEqual("startDate")
    @MaxDateRange("startDate", 30)
    endDate?: string;
}
