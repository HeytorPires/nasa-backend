import { Controller, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { TechportProjectParamDto, TechportProjectsQueryDto } from "./dto/techport-query.dto";
import { TechportService } from "./techport.service";

import type {
    TechportProject,
    TechportProjectsResponse,
} from "src/shared/providers/techport/models/techport-response.interface";

@ApiTags("TechPort")
@Controller({ path: "techport", version: "1" })
export class TechportController {
    constructor(private readonly techportService: TechportService) {}

    @Get("projects")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Lista os projetos de tecnologia atualizados a partir de uma data." })
    @ApiOkResponse({ description: "Ids de projeto com a data da última atualização." })
    listProjects(@Query() query: TechportProjectsQueryDto): Promise<TechportProjectsResponse> {
        return this.techportService.listProjects(query.updatedSince);
    }

    @Get("projects/:projectId")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Detalha um projeto do TechPort." })
    findProject(@Param() params: TechportProjectParamDto): Promise<TechportProject> {
        return this.techportService.findProject(params.projectId);
    }
}
