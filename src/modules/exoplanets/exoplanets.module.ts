import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "src/shared/providers/cache/cache.module";
import { ExoplanetModule as ExoplanetProviderModule } from "src/shared/providers/exoplanet/exoplanet.module";
import { EXOPLANET_REPOSITORY } from "src/shared/tokens";
import { ExoplanetEntity } from "./entities/exoplanet.entity";
import { ExoplanetsController } from "./exoplanets.controller";
import { ExoplanetsService } from "./exoplanets.service";
import { TypeOrmExoplanetRepository } from "./repositories/typeorm/typeorm-exoplanet.repository";

@Module({
    imports: [TypeOrmModule.forFeature([ExoplanetEntity]), CacheModule, ExoplanetProviderModule],
    controllers: [ExoplanetsController],
    providers: [
        ExoplanetsService,
        {
            provide: EXOPLANET_REPOSITORY,
            useClass: TypeOrmExoplanetRepository,
        },
    ],
})
export class ExoplanetsModule {}
