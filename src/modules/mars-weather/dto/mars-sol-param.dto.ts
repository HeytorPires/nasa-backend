import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";

export class MarsSolParamDto {
    @ApiProperty({ description: "Número do sol (dia marciano).", example: 675 })
    @Type(() => Number)
    @IsInt({ message: "sol deve ser um número inteiro" })
    @Min(0)
    sol: number;
}
