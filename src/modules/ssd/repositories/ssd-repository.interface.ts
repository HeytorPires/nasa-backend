import type { DeepPartial } from "typeorm";
import { SsdCloseApproachEntity } from "../entities/ssd-close-approach.entity";
import { SsdFireballEntity } from "../entities/ssd-fireball.entity";
import { SsdSentryObjectEntity } from "../entities/ssd-sentry-object.entity";

export interface ISsdRepository {
    upsertCloseApproaches(rows: DeepPartial<SsdCloseApproachEntity>[]): Promise<void>;
    upsertFireballs(rows: DeepPartial<SsdFireballEntity>[]): Promise<void>;
    upsertSentryObjects(rows: DeepPartial<SsdSentryObjectEntity>[]): Promise<void>;
}
