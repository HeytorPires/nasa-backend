import { ApiProperty } from "@nestjs/swagger";
import { Matches } from "class-validator";

export class NeoIdParamDto {
    @ApiProperty({ description: "SPK-ID do asteroide no JPL.", example: "3542519" })
    @Matches(/^\d{1,16}$/, { message: "asteroidId deve ser numérico" })
    asteroidId: string;
}
