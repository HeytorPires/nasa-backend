import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "src/shared/providers/cache/cache.module";
import { EpicModule as EpicProviderModule } from "src/shared/providers/epic/epic.module";
import { EPIC_REPOSITORY } from "src/shared/tokens";
import { EpicImageEntity } from "./entities/epic-image.entity";
import { EpicController } from "./epic.controller";
import { EpicService } from "./epic.service";
import { TypeOrmEpicRepository } from "./repositories/typeorm/typeorm-epic.repository";

@Module({
    imports: [TypeOrmModule.forFeature([EpicImageEntity]), CacheModule, EpicProviderModule],
    controllers: [EpicController],
    providers: [
        EpicService,
        {
            provide: EPIC_REPOSITORY,
            useClass: TypeOrmEpicRepository,
        },
    ],
})
export class EpicModule {}
