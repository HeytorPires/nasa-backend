import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";

export class TleIdParamDto {
    @ApiProperty({ description: "NORAD catalog number.", example: 25544 })
    @Type(() => Number)
    @IsInt({ message: "satelliteId deve ser um número inteiro" })
    @Min(1)
    satelliteId: number;
}
