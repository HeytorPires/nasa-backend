import { Controller, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { TleIdParamDto } from "./dto/tle-id-param.dto";
import { TleSearchQueryDto } from "./dto/tle-search-query.dto";
import { TleService } from "./tle.service";

import type { TleCollection, TleRecord } from "src/shared/providers/tle/models/tle-response.interface";

@ApiTags("TLE")
@Controller({ path: "tle", version: "1" })
export class TleController {
    constructor(private readonly tleService: TleService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Busca conjuntos de elementos orbitais pelo nome do satélite." })
    @ApiOkResponse({ description: "Coleção paginada de TLEs." })
    search(@Query() query: TleSearchQueryDto): Promise<TleCollection> {
        return this.tleService.search(query.search, query.page ?? 1, query.pageSize ?? 20);
    }

    @Get(":satelliteId")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Busca o TLE corrente de um satélite pelo número NORAD." })
    findBySatelliteId(@Param() params: TleIdParamDto): Promise<TleRecord> {
        return this.tleService.findBySatelliteId(params.satelliteId);
    }
}
