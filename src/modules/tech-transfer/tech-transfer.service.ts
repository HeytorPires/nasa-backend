import { Inject, Injectable } from "@nestjs/common";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { ITechTransferProvider } from "src/shared/providers/tech-transfer/models/tech-transfer-provider.interface";
import { CACHE_PROVIDER, TECH_TRANSFER_PROVIDER, TECH_TRANSFER_REPOSITORY } from "src/shared/tokens";
import { ITechTransferRepository } from "./repositories/tech-transfer-repository.interface";

import type { DeepPartial } from "typeorm";
import type {
    TechTransferCategory,
    TechTransferItem,
    TechTransferResult,
} from "src/shared/providers/tech-transfer/models/tech-transfer-response.interface";
import type { TechTransferItemEntity } from "./entities/tech-transfer-item.entity";

const CACHE_TTL_SECONDS = 60 * 60 * 24;

@Injectable()
export class TechTransferService {
    constructor(
        @Inject(TECH_TRANSFER_PROVIDER) private readonly techTransferProvider: ITechTransferProvider,
        @Inject(TECH_TRANSFER_REPOSITORY) private readonly techTransferRepository: ITechTransferRepository,
        @Inject(CACHE_PROVIDER) private readonly cacheProvider: ICacheProvider,
    ) {}

    async search(category: TechTransferCategory, term: string): Promise<TechTransferResult> {
        return await this.cacheProvider.getOrSet<TechTransferResult>(
            `tech-transfer:${category}:${term.toLowerCase()}`,
            CACHE_TTL_SECONDS,
            async () => {
                const result = await this.techTransferProvider.search(category, term);
                await this.persist(category, result.results);

                return result;
            },
        );
    }

    private async persist(category: TechTransferCategory, items: TechTransferItem[]): Promise<void> {
        const entities = items.filter((item) => item.id.length > 0).map((item) => this.toEntity(category, item));

        if (entities.length === 0) {
            return;
        }

        await this.techTransferRepository.upsertMany(entities);
    }

    private toEntity(category: TechTransferCategory, item: TechTransferItem): DeepPartial<TechTransferItemEntity> {
        return {
            category,
            external_id: item.id,
            case_number: item.case_number || null,
            title: item.title,
            description: item.description || null,
            center: item.center || null,
            payload: { ...item },
        };
    }
}
