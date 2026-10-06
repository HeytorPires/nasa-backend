import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { EpicCollectionParamDto, EpicDateParamDto } from "./dto/epic-collection-param.dto";
import { EpicImageDto, EpicService } from "./epic.service";

@ApiTags("EPIC")
@Controller({ path: "epic", version: "1" })
export class EpicController {
    constructor(private readonly epicService: EpicService) {}

    @Get(":collection/latest")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Imagens da data mais recente disponível." })
    @ApiOkResponse({ description: "Imagens com a URL pronta do arquivo público." })
    findLatest(@Param() params: EpicCollectionParamDto): Promise<EpicImageDto[]> {
        return this.epicService.findLatest(params.collection);
    }

    @Get(":collection/dates")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Lista todas as datas com imagens disponíveis." })
    findAvailableDates(@Param() params: EpicCollectionParamDto): Promise<string[]> {
        return this.epicService.findAvailableDates(params.collection);
    }

    @Get(":collection/date/:date")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Imagens capturadas em uma data." })
    findByDate(@Param() params: EpicDateParamDto): Promise<EpicImageDto[]> {
        return this.epicService.findByDate(params.collection, params.date);
    }
}
