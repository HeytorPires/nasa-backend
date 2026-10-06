import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsISO8601 } from "class-validator";
import { EPIC_COLLECTIONS, EpicCollection } from "src/shared/providers/epic/models/epic-response.interface";

export class EpicCollectionParamDto {
    @ApiProperty({ enum: EPIC_COLLECTIONS, description: "Coleção de imagens do EPIC." })
    @IsIn(EPIC_COLLECTIONS, { message: `collection deve ser um de: ${EPIC_COLLECTIONS.join(", ")}` })
    collection: EpicCollection;
}

export class EpicDateParamDto extends EpicCollectionParamDto {
    @ApiProperty({ description: "Data da captura (YYYY-MM-DD).", example: "2019-05-30" })
    @IsISO8601({ strict: true }, { message: "date deve estar no formato YYYY-MM-DD" })
    date: string;
}
