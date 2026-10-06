import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ExoplanetQueryDto } from "./dto/exoplanet-query.dto";
import { ExoplanetsService } from "./exoplanets.service";

import type { ExoplanetRow } from "src/shared/providers/exoplanet/models/exoplanet-response.interface";

@ApiTags("Exoplanets")
@Controller({ path: "exoplanets", version: "1" })
export class ExoplanetsController {
    constructor(private readonly exoplanetsService: ExoplanetsService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: "Consulta o Exoplanet Archive por filtros nomeados.",
        description:
            "A API não aceita ADQL livre: cada filtro vira uma condição montada no servidor a partir de uma " +
            "allowlist de colunas.",
    })
    @ApiOkResponse({ description: "Linhas da tabela pscomppars." })
    find(@Query() query: ExoplanetQueryDto): Promise<ExoplanetRow[]> {
        return this.exoplanetsService.find(query);
    }
}
