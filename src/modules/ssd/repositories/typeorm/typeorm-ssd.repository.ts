import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, ObjectLiteral, Repository } from "typeorm";
import { SsdCloseApproachEntity } from "../../entities/ssd-close-approach.entity";
import { SsdFireballEntity } from "../../entities/ssd-fireball.entity";
import { SsdSentryObjectEntity } from "../../entities/ssd-sentry-object.entity";
import { ISsdRepository } from "../ssd-repository.interface";

@Injectable()
export class TypeOrmSsdRepository implements ISsdRepository {
    constructor(
        @InjectRepository(SsdCloseApproachEntity)
        private readonly closeApproachRepository: Repository<SsdCloseApproachEntity>,
        @InjectRepository(SsdFireballEntity)
        private readonly fireballRepository: Repository<SsdFireballEntity>,
        @InjectRepository(SsdSentryObjectEntity)
        private readonly sentryRepository: Repository<SsdSentryObjectEntity>,
    ) {}

    async upsertCloseApproaches(rows: DeepPartial<SsdCloseApproachEntity>[]): Promise<void> {
        await this.upsert(this.closeApproachRepository, rows, ["designation", "close_approach_at"]);
    }

    async upsertFireballs(rows: DeepPartial<SsdFireballEntity>[]): Promise<void> {
        await this.upsert(this.fireballRepository, rows, ["observed_at", "latitude", "longitude"]);
    }

    async upsertSentryObjects(rows: DeepPartial<SsdSentryObjectEntity>[]): Promise<void> {
        await this.upsert(this.sentryRepository, rows, ["designation"]);
    }

    private async upsert<Entity extends ObjectLiteral>(
        repository: Repository<Entity>,
        rows: DeepPartial<Entity>[],
        conflictPaths: string[],
    ): Promise<void> {
        if (rows.length === 0) {
            return;
        }

        await repository.upsert(rows as never, { conflictPaths, skipUpdateIfNoValuesChanged: true });
    }
}
