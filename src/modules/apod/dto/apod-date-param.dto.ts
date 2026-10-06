import { ApiProperty } from "@nestjs/swagger";
import { IsISO8601 } from "class-validator";

export class ApodDateParamDto {
    @ApiProperty({ description: "Data do APOD (YYYY-MM-DD).", example: "2024-05-01" })
    @IsISO8601({ strict: true }, { message: "date deve estar no formato YYYY-MM-DD" })
    date: string;
}
