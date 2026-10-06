import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
    SsdCloseApproachQueryDto,
    SsdFireballQueryDto,
    SsdMissionDesignQueryDto,
    SsdSentryQueryDto,
} from "./dto/ssd-query.dto";
import { SsdService } from "./ssd.service";

import type { SsdSentryResponse, SsdTableResponse } from "src/shared/providers/ssd/models/ssd-response.interface";

@ApiTags("SSD/CNEOS")
@Controller({ path: "ssd", version: "1" })
export class SsdController {
    constructor(private readonly ssdService: SsdService) {}

    @Get("close-approaches")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Aproximações de asteroides e cometas aos planetas." })
    @ApiOkResponse({ description: "Tabela `fields`/`data` no formato do JPL." })
    findCloseApproaches(@Query() query: SsdCloseApproachQueryDto): Promise<SsdTableResponse> {
        return this.ssdService.findCloseApproaches(query);
    }

    @Get("fireballs")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Impactos atmosféricos registrados por sensores do governo dos EUA." })
    findFireballs(@Query() query: SsdFireballQueryDto): Promise<SsdTableResponse> {
        return this.ssdService.findFireballs(query);
    }

    @Get("sentry")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Avaliação de risco de impacto do sistema Sentry." })
    findSentry(@Query() query: SsdSentryQueryDto): Promise<SsdSentryResponse> {
        return this.ssdService.findSentry(query);
    }

    @Get("nhats")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "NEOs acessíveis a missões tripuladas (NHATS)." })
    findNhats(): Promise<SsdTableResponse> {
        return this.ssdService.findNhats();
    }

    @Get("scout")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Órbitas e risco de impacto em tempo quase real do NEOCP." })
    findScout(): Promise<unknown> {
        return this.ssdService.findScout();
    }

    @Get("mission-design")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Suíte de projeto de missões a corpos pequenos." })
    findMissionDesign(@Query() query: SsdMissionDesignQueryDto): Promise<unknown> {
        return this.ssdService.findMissionDesign({ ...query });
    }
}
