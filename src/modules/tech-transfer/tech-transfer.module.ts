import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "src/shared/providers/cache/cache.module";
import { TechTransferModule as TechTransferProviderModule } from "src/shared/providers/tech-transfer/tech-transfer.module";
import { TECH_TRANSFER_REPOSITORY } from "src/shared/tokens";
import { TechTransferItemEntity } from "./entities/tech-transfer-item.entity";
import { TypeOrmTechTransferRepository } from "./repositories/typeorm/typeorm-tech-transfer.repository";
import { TechTransferController } from "./tech-transfer.controller";
import { TechTransferService } from "./tech-transfer.service";

@Module({
    imports: [TypeOrmModule.forFeature([TechTransferItemEntity]), CacheModule, TechTransferProviderModule],
    controllers: [TechTransferController],
    providers: [
        TechTransferService,
        {
            provide: TECH_TRANSFER_REPOSITORY,
            useClass: TypeOrmTechTransferRepository,
        },
    ],
})
export class TechTransferModule {}
