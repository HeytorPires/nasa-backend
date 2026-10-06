import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { MarsSolParamDto } from "./dto/mars-sol-param.dto";
import { MarsSolDto, MarsWeatherService } from "./mars-weather.service";

@ApiTags("Mars Weather")
@Controller({ path: "mars-weather", version: "1" })
export class MarsWeatherController {
    constructor(private readonly marsWeatherService: MarsWeatherService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Resumo meteorológico dos sols mais recentes em Elysium Planitia." })
    @ApiOkResponse({ description: "Sols do mais recente para o mais antigo." })
    findLatest(): Promise<MarsSolDto[]> {
        return this.marsWeatherService.findLatest();
    }

    @Get(":sol")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Resumo meteorológico de um sol específico." })
    findBySol(@Param() params: MarsSolParamDto): Promise<MarsSolDto> {
        return this.marsWeatherService.findBySol(params.sol);
    }
}
