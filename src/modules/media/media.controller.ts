import { Controller, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { MediaIdParamDto } from "./dto/media-id-param.dto";
import { MediaSearchQueryDto } from "./dto/media-search-query.dto";
import { MediaService } from "./media.service";

import type {
    MediaAssetResponse,
    MediaSearchResponse,
} from "src/shared/providers/media/models/media-response.interface";

@ApiTags("Image and Video Library")
@Controller({ path: "media", version: "1" })
export class MediaController {
    constructor(private readonly mediaService: MediaService) {}

    @Get("search")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Busca itens no acervo de imagens e vídeos da NASA." })
    @ApiOkResponse({ description: "Coleção paginada no formato do images.nasa.gov." })
    search(@Query() query: MediaSearchQueryDto): Promise<MediaSearchResponse> {
        return this.mediaService.search(query);
    }

    @Get(":nasaId/asset")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Manifesto de arquivos de um item." })
    findAsset(@Param() params: MediaIdParamDto): Promise<MediaAssetResponse> {
        return this.mediaService.findAsset(params.nasaId);
    }

    @Get(":nasaId/metadata")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Localização do arquivo de metadados de um item." })
    findMetadata(@Param() params: MediaIdParamDto): Promise<MediaAssetResponse> {
        return this.mediaService.findMetadataLocation(params.nasaId);
    }

    @Get(":nasaId/captions")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Localização do arquivo de legendas de um vídeo." })
    findCaptions(@Param() params: MediaIdParamDto): Promise<MediaAssetResponse> {
        return this.mediaService.findCaptionsLocation(params.nasaId);
    }
}
