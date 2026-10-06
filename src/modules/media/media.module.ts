import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "src/shared/providers/cache/cache.module";
import { MediaModule as MediaProviderModule } from "src/shared/providers/media/media.module";
import { MEDIA_REPOSITORY } from "src/shared/tokens";
import { MediaAssetEntity } from "./entities/media-asset.entity";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";
import { TypeOrmMediaRepository } from "./repositories/typeorm/typeorm-media.repository";

@Module({
    imports: [TypeOrmModule.forFeature([MediaAssetEntity]), CacheModule, MediaProviderModule],
    controllers: [MediaController],
    providers: [
        MediaService,
        {
            provide: MEDIA_REPOSITORY,
            useClass: TypeOrmMediaRepository,
        },
    ],
})
export class MediaModule {}
