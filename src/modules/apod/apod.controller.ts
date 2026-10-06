import { Controller, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { ApodService } from "./apod.service";
import { ApodDateParamDto } from "./dto/apod-date-param.dto";
import { ApodDateRangeDto } from "./dto/apod-date-range.dto";
import { ApodRandomQueryDto } from "./dto/apod-random.dto";
import { ApodResponseDto } from "./dto/apod-response.dto";

@ApiTags("APOD")
@Controller({ path: "apods", version: "1" })
export class ApodController {
    constructor(private readonly apodService: ApodService) {}

    @Get("random")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Sorteia APODs de datas aleatórias." })
    @ApiOkResponse({ type: ApodResponseDto, isArray: true })
    findRandom(@Query() query: ApodRandomQueryDto): Promise<ApodResponseDto[]> {
        return this.apodService.findRandom(query.quantity ?? 1);
    }

    @Get("range")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Lista os APODs de um intervalo de até 30 dias." })
    @ApiOkResponse({ type: ApodResponseDto, isArray: true })
    findBetweenDates(@Query() query: ApodDateRangeDto): Promise<ApodResponseDto[]> {
        return this.apodService.findBetweenDates(query.startDate, query.endDate);
    }

    @Get(":date")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Busca o APOD de uma data." })
    @ApiParam({ name: "date", example: "2024-05-01", description: "Data no formato YYYY-MM-DD." })
    @ApiOkResponse({ type: ApodResponseDto })
    findByDate(@Param() params: ApodDateParamDto): Promise<ApodResponseDto> {
        return this.apodService.findByDate(params.date);
    }
}
