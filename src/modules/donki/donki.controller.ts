import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DonkiService } from "./donki.service";
import {
    DonkiCmeAnalysisQueryDto,
    DonkiIpsQueryDto,
    DonkiNotificationsQueryDto,
    DonkiQueryDto,
} from "./dto/donki-query.dto";

import type { DonkiEvent } from "src/shared/providers/donki/models/donki-response.interface";

@ApiTags("DONKI")
@Controller({ path: "donki", version: "1" })
export class DonkiController {
    constructor(private readonly donkiService: DonkiService) {}

    @Get("cme")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Ejeções de massa coronal." })
    @ApiOkResponse({ description: "Eventos do intervalo." })
    findCme(@Query() query: DonkiQueryDto): Promise<DonkiEvent[]> {
        return this.donkiService.findEvents("cme", query);
    }

    @Get("cme-analysis")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Análises de ejeções de massa coronal." })
    findCmeAnalysis(@Query() query: DonkiCmeAnalysisQueryDto): Promise<DonkiEvent[]> {
        return this.donkiService.findEvents("cme-analysis", query);
    }

    @Get("gst")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Tempestades geomagnéticas." })
    findGst(@Query() query: DonkiQueryDto): Promise<DonkiEvent[]> {
        return this.donkiService.findEvents("gst", query);
    }

    @Get("ips")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Choques interplanetários." })
    findIps(@Query() query: DonkiIpsQueryDto): Promise<DonkiEvent[]> {
        return this.donkiService.findEvents("ips", query);
    }

    @Get("flr")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Explosões solares." })
    findFlr(@Query() query: DonkiQueryDto): Promise<DonkiEvent[]> {
        return this.donkiService.findEvents("flr", query);
    }

    @Get("sep")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Partículas energéticas solares." })
    findSep(@Query() query: DonkiQueryDto): Promise<DonkiEvent[]> {
        return this.donkiService.findEvents("sep", query);
    }

    @Get("mpc")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Cruzamentos de magnetopausa." })
    findMpc(@Query() query: DonkiQueryDto): Promise<DonkiEvent[]> {
        return this.donkiService.findEvents("mpc", query);
    }

    @Get("rbe")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Intensificações do cinturão de radiação." })
    findRbe(@Query() query: DonkiQueryDto): Promise<DonkiEvent[]> {
        return this.donkiService.findEvents("rbe", query);
    }

    @Get("hss")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Fluxos de vento solar de alta velocidade." })
    findHss(@Query() query: DonkiQueryDto): Promise<DonkiEvent[]> {
        return this.donkiService.findEvents("hss", query);
    }

    @Get("wsa-enlil")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Simulações WSA+Enlil." })
    findWsaEnlil(@Query() query: DonkiQueryDto): Promise<DonkiEvent[]> {
        return this.donkiService.findEvents("wsa-enlil", query);
    }

    @Get("notifications")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Notificações de clima espacial (intervalo máximo de 30 dias)." })
    findNotifications(@Query() query: DonkiNotificationsQueryDto): Promise<DonkiEvent[]> {
        return this.donkiService.findEvents("notifications", query);
    }
}
