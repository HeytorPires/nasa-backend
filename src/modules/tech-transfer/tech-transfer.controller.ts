import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { TechTransferQueryDto } from "./dto/tech-transfer-query.dto";
import { TechTransferService } from "./tech-transfer.service";

import type { TechTransferResult } from "src/shared/providers/tech-transfer/models/tech-transfer-response.interface";

@ApiTags("TechTransfer")
@Controller({ path: "tech-transfer", version: "1" })
export class TechTransferController {
    constructor(private readonly techTransferService: TechTransferService) {}

    @Get("patents")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Busca patentes da NASA." })
    @ApiOkResponse({ description: "Resultados normalizados em objetos nomeados." })
    findPatents(@Query() query: TechTransferQueryDto): Promise<TechTransferResult> {
        return this.techTransferService.search("patent", query.q);
    }

    @Get("patents-issued")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Busca patentes já concedidas." })
    findPatentsIssued(@Query() query: TechTransferQueryDto): Promise<TechTransferResult> {
        return this.techTransferService.search("patent_issued", query.q);
    }

    @Get("software")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Busca software publicado pela NASA." })
    findSoftware(@Query() query: TechTransferQueryDto): Promise<TechTransferResult> {
        return this.techTransferService.search("software", query.q);
    }

    @Get("spinoffs")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Busca spinoffs derivados de tecnologia da NASA." })
    findSpinoffs(@Query() query: TechTransferQueryDto): Promise<TechTransferResult> {
        return this.techTransferService.search("spinoff", query.q);
    }
}
