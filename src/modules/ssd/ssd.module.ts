import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "src/shared/providers/cache/cache.module";
import { SsdModule as SsdProviderModule } from "src/shared/providers/ssd/ssd.module";
import { SSD_REPOSITORY } from "src/shared/tokens";
import { SsdCloseApproachEntity } from "./entities/ssd-close-approach.entity";
import { SsdFireballEntity } from "./entities/ssd-fireball.entity";
import { SsdSentryObjectEntity } from "./entities/ssd-sentry-object.entity";
import { TypeOrmSsdRepository } from "./repositories/typeorm/typeorm-ssd.repository";
import { SsdController } from "./ssd.controller";
import { SsdService } from "./ssd.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([SsdCloseApproachEntity, SsdFireballEntity, SsdSentryObjectEntity]),
        CacheModule,
        SsdProviderModule,
    ],
    controllers: [SsdController],
    providers: [
        SsdService,
        {
            provide: SSD_REPOSITORY,
            useClass: TypeOrmSsdRepository,
        },
    ],
})
export class SsdModule {}
