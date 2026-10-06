import { Controller, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { EonetCategoryParamDto } from "./dto/eonet-category-param.dto";
import { EonetEventsQueryDto } from "./dto/eonet-events-query.dto";
import { EonetService } from "./eonet.service";

import type {
    EonetCategory,
    EonetEvent,
    EonetSource,
} from "src/shared/providers/eonet/models/eonet-response.interface";

@ApiTags("EONET")
@Controller({ path: "eonet", version: "1" })
export class EonetController {
    constructor(private readonly eonetService: EonetService) {}

    @Get("events")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Lista eventos naturais rastreados pelo EONET." })
    @ApiOkResponse({ description: "Eventos que satisfazem o filtro." })
    findEvents(@Query() query: EonetEventsQueryDto): Promise<EonetEvent[]> {
        return this.eonetService.findEvents(query);
    }

    @Get("categories")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Lista as categorias de evento do EONET." })
    findCategories(): Promise<EonetCategory[]> {
        return this.eonetService.findCategories();
    }

    @Get("sources")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Lista as fontes de dados do EONET." })
    findSources(): Promise<EonetSource[]> {
        return this.eonetService.findSources();
    }

    @Get("layers")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Lista todas as camadas de imagens do EONET." })
    findLayers(): Promise<unknown> {
        return this.eonetService.findLayers();
    }

    @Get("layers/:category")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Lista as camadas de imagens de uma categoria." })
    findLayersByCategory(@Param() params: EonetCategoryParamDto): Promise<unknown> {
        return this.eonetService.findLayers(params.category);
    }
}
