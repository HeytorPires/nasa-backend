import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "src/shared/providers/cache/cache.module";
import { NeoModule as NeoProviderModule } from "src/shared/providers/neo/neo.module";
import { NEO_REPOSITORY } from "src/shared/tokens";
import { NeoFeedDayEntity } from "./entities/neo-feed-day.entity";
import { NeoObjectEntity } from "./entities/neo-object.entity";
import { NeoController } from "./neo.controller";
import { NeoService } from "./neo.service";
import { TypeOrmNeoRepository } from "./repositories/typeorm/typeorm-neo.repository";

@Module({
    imports: [TypeOrmModule.forFeature([NeoObjectEntity, NeoFeedDayEntity]), CacheModule, NeoProviderModule],
    controllers: [NeoController],
    providers: [
        NeoService,
        {
            provide: NEO_REPOSITORY,
            useClass: TypeOrmNeoRepository,
        },
    ],
})
export class NeoModule {}
