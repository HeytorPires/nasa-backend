import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsISO8601, IsInt, IsOptional, Min } from "class-validator";

export class TechportProjectsQueryDto {
    @ApiPropertyOptional({
        description: "Só projetos atualizados a partir desta data (YYYY-MM-DD). Padrão: 30 dias atrás.",
        example: "2024-01-01",
    })
    @IsOptional()
    @IsISO8601({ strict: true }, { message: "updatedSince deve estar no formato YYYY-MM-DD" })
    updatedSince?: string;
}

export class TechportProjectParamDto {
    @ApiProperty({ description: "Id do projeto no TechPort.", example: 93851 })
    @Type(() => Number)
    @IsInt({ message: "projectId deve ser um número inteiro" })
    @Min(1)
    projectId: number;
}
