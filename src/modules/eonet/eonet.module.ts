import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "src/shared/providers/cache/cache.module";
import { EonetModule as EonetProviderModule } from "src/shared/providers/eonet/eonet.module";
import { EONET_REPOSITORY } from "src/shared/tokens";
import { EonetController } from "./eonet.controller";
import { EonetService } from "./eonet.service";
import { EonetEventEntity } from "./entities/eonet-event.entity";
import { TypeOrmEonetRepository } from "./repositories/typeorm/typeorm-eonet.repository";

@Module({
    imports: [TypeOrmModule.forFeature([EonetEventEntity]), CacheModule, EonetProviderModule],
    controllers: [EonetController],
    providers: [
        EonetService,
        {
            provide: EONET_REPOSITORY,
            useClass: TypeOrmEonetRepository,
        },
    ],
})
export class EonetModule {}
