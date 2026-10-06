import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Matches } from "class-validator";

export class EonetCategoryParamDto {
    @ApiProperty({ description: "Id da categoria do EONET.", example: "wildfires" })
    @IsOptional()
    @IsString()
    @Matches(/^[a-zA-Z]+$/, { message: "category aceita apenas letras" })
    category?: string;
}
