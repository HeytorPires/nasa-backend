import { ApiProperty } from "@nestjs/swagger";
import { Matches } from "class-validator";

export class MediaIdParamDto {
    @ApiProperty({ description: "Identificador do item na NASA Image and Video Library.", example: "as11-42-6179" })
    @Matches(/^[A-Za-z0-9._-]{1,255}$/, { message: "nasaId contém caracteres inválidos" })
    nasaId: string;
}
