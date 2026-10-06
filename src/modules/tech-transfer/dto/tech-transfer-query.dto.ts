import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class TechTransferQueryDto {
    @ApiProperty({ description: "Termo de busca.", example: "engine" })
    @IsString()
    @MinLength(2, { message: "q deve ter ao menos 2 caracteres" })
    @MaxLength(128)
    q: string;
}
