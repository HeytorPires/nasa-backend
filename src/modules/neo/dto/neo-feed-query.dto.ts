import { ApiProperty } from "@nestjs/swagger";
import { IsISO8601 } from "class-validator";
import { IsAfterOrEqual } from "src/shared/validators/is-after-or-equal.validator";
import { MaxDateRange } from "src/shared/validators/max-date-range.validator";

export const NEO_FEED_MAX_RANGE_DAYS = 7;

export class NeoFeedQueryDto {
    @ApiProperty({ description: "Data inicial (YYYY-MM-DD).", example: "2024-05-01" })
    @IsISO8601({ strict: true }, { message: "startDate deve estar no formato YYYY-MM-DD" })
    startDate: string;

    @ApiProperty({ description: "Data final (YYYY-MM-DD). No máximo 7 dias após startDate.", example: "2024-05-07" })
    @IsISO8601({ strict: true }, { message: "endDate deve estar no formato YYYY-MM-DD" })
    @IsAfterOrEqual("startDate")
    @MaxDateRange("startDate", NEO_FEED_MAX_RANGE_DAYS)
    endDate: string;
}
