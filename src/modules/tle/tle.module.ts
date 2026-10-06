import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "src/shared/providers/cache/cache.module";
import { TleModule as TleProviderModule } from "src/shared/providers/tle/tle.module";
import { TLE_REPOSITORY } from "src/shared/tokens";
import { TleRecordEntity } from "./entities/tle-record.entity";
import { TypeOrmTleRepository } from "./repositories/typeorm/typeorm-tle.repository";
import { TleController } from "./tle.controller";
import { TleService } from "./tle.service";

@Module({
    imports: [TypeOrmModule.forFeature([TleRecordEntity]), CacheModule, TleProviderModule],
    controllers: [TleController],
    providers: [
        TleService,
        {
            provide: TLE_REPOSITORY,
            useClass: TypeOrmTleRepository,
        },
    ],
})
export class TleModule {}
