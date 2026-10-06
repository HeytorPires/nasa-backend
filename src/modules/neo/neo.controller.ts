import { Controller, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PaginationQueryDto } from "src/shared/dto/pagination-query.dto";
import { NeoFeedQueryDto } from "./dto/neo-feed-query.dto";
import { NeoIdParamDto } from "./dto/neo-id-param.dto";
import { NeoService } from "./neo.service";

import type {
    NeoBrowseResponse,
    NeoFeedResponse,
    NeoObject,
} from "src/shared/providers/neo/models/neo-response.interface";

@ApiTags("NeoWs")
@Controller({ path: "neo", version: "1" })
export class NeoController {
    constructor(private readonly neoService: NeoService) {}

    @Get("feed")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Lista asteroides por data de maior aproximação da Terra (janela de até 7 dias)." })
    @ApiOkResponse({ description: "Objetos agrupados por data." })
    findFeed(@Query() query: NeoFeedQueryDto): Promise<NeoFeedResponse> {
        return this.neoService.findFeed(query.startDate, query.endDate);
    }

    @Get("browse")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Navega pelo catálogo completo de objetos próximos à Terra." })
    browse(@Query() query: PaginationQueryDto): Promise<NeoBrowseResponse> {
        return this.neoService.browse(query.page ?? 0, query.size ?? 20);
    }

    @Get(":asteroidId")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Busca um asteroide pelo SPK-ID do JPL." })
    findById(@Param() params: NeoIdParamDto): Promise<NeoObject> {
        return this.neoService.findById(params.asteroidId);
    }
}
