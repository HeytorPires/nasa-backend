import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "src/shared/providers/cache/cache.module";
import { DonkiModule as DonkiProviderModule } from "src/shared/providers/donki/donki.module";
import { DONKI_REPOSITORY } from "src/shared/tokens";
import { DonkiController } from "./donki.controller";
import { DonkiService } from "./donki.service";
import { DonkiEventEntity } from "./entities/donki-event.entity";
import { TypeOrmDonkiRepository } from "./repositories/typeorm/typeorm-donki.repository";

@Module({
    imports: [TypeOrmModule.forFeature([DonkiEventEntity]), CacheModule, DonkiProviderModule],
    controllers: [DonkiController],
    providers: [
        DonkiService,
        {
            provide: DONKI_REPOSITORY,
            useClass: TypeOrmDonkiRepository,
        },
    ],
})
export class DonkiModule {}
