import { Inject, Injectable } from "@nestjs/common";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { IMediaProvider, MediaSearchQuery } from "src/shared/providers/media/models/media-provider.interface";
import { CACHE_PROVIDER, MEDIA_PROVIDER, MEDIA_REPOSITORY } from "src/shared/tokens";
import { IMediaRepository } from "./repositories/media-repository.interface";

import type { DeepPartial } from "typeorm";
import type {
    MediaAssetResponse,
    MediaItem,
    MediaSearchResponse,
} from "src/shared/providers/media/models/media-response.interface";
import type { MediaAssetEntity } from "./entities/media-asset.entity";

const CACHE_TTL_SECONDS = 60 * 60 * 6;

@Injectable()
export class MediaService {
    constructor(
        @Inject(MEDIA_PROVIDER) private readonly mediaProvider: IMediaProvider,
        @Inject(MEDIA_REPOSITORY) private readonly mediaRepository: IMediaRepository,
        @Inject(CACHE_PROVIDER) private readonly cacheProvider: ICacheProvider,
    ) {}

    async search(query: MediaSearchQuery): Promise<MediaSearchResponse> {
        const cacheKey = `media:search:${JSON.stringify(query)}`;

        return await this.cacheProvider.getOrSet<MediaSearchResponse>(cacheKey, CACHE_TTL_SECONDS, async () => {
            const response = await this.mediaProvider.search(query);
            await this.persist(response.collection?.items ?? []);

            return response;
        });
    }

    async findAsset(nasaId: string): Promise<MediaAssetResponse> {
        return await this.cacheProvider.getOrSet(`media:asset:${nasaId}`, CACHE_TTL_SECONDS, () =>
            this.mediaProvider.getAsset(nasaId),
        );
    }

    async findMetadataLocation(nasaId: string): Promise<MediaAssetResponse> {
        return await this.cacheProvider.getOrSet(`media:metadata:${nasaId}`, CACHE_TTL_SECONDS, () =>
            this.mediaProvider.getMetadataLocation(nasaId),
        );
    }

    async findCaptionsLocation(nasaId: string): Promise<MediaAssetResponse> {
        return await this.cacheProvider.getOrSet(`media:captions:${nasaId}`, CACHE_TTL_SECONDS, () =>
            this.mediaProvider.getCaptionsLocation(nasaId),
        );
    }

    private async persist(items: MediaItem[]): Promise<void> {
        const entities = items
            .map((item) => this.toEntity(item))
            .filter((entity): entity is DeepPartial<MediaAssetEntity> => entity !== null);

        if (entities.length === 0) {
            return;
        }

        await this.mediaRepository.upsertMany(entities);
    }

    private toEntity(item: MediaItem): DeepPartial<MediaAssetEntity> | null {
        const data = item.data?.[0];

        if (!data?.nasa_id) {
            return null;
        }

        const dateCreated = data.date_created ? new Date(data.date_created) : null;

        return {
            nasa_id: data.nasa_id,
            title: data.title ?? "",
            media_type: data.media_type ?? "unknown",
            date_created: dateCreated && !Number.isNaN(dateCreated.getTime()) ? dateCreated : null,
            center: data.center ?? null,
            keywords: data.keywords ?? [],
            payload: item,
        };
    }
}
