import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "src/shared/providers/cache/cache.module";
import { TechportModule as TechportProviderModule } from "src/shared/providers/techport/techport.module";
import { TECHPORT_REPOSITORY } from "src/shared/tokens";
import { TechportProjectEntity } from "./entities/techport-project.entity";
import { TypeOrmTechportRepository } from "./repositories/typeorm/typeorm-techport.repository";
import { TechportController } from "./techport.controller";
import { TechportService } from "./techport.service";

@Module({
    imports: [TypeOrmModule.forFeature([TechportProjectEntity]), CacheModule, TechportProviderModule],
    controllers: [TechportController],
    providers: [
        TechportService,
        {
            provide: TECHPORT_REPOSITORY,
            useClass: TypeOrmTechportRepository,
        },
    ],
})
export class TechportModule {}
