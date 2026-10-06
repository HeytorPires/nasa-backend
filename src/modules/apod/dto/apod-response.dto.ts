import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ApodResponseDto {
    @ApiProperty({ example: "2024-05-01" })
    date: string;

    @ApiProperty({ example: "M83: The Southern Pinwheel" })
    title: string;

    @ApiProperty({ description: "Texto explicativo, sem HTML." })
    explanation: string;

    @ApiProperty({ example: "image", enum: ["image", "video", "other"] })
    media_type: string;

    @ApiProperty({ description: "URL da mídia." })
    url: string;

    @ApiPropertyOptional({ description: "URL da mídia em alta resolução." })
    hdurl?: string;

    @ApiPropertyOptional({ description: "Página do artigo em science.nasa.gov." })
    permalink?: string;

    @ApiPropertyOptional()
    copyright?: string;

    @ApiPropertyOptional({ description: "Texto alternativo da imagem." })
    alt?: string;

    @ApiPropertyOptional({ description: "Presente apenas em registros vindos da API legada." })
    service_version?: string;
}
