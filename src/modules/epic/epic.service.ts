import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { IEpicProvider } from "src/shared/providers/epic/models/epic-provider.interface";
import { ScheduledTask } from "src/shared/providers/scheduler/decorators/scheduled-task.decorator";
import { CACHE_PROVIDER, EPIC_PROVIDER, EPIC_REPOSITORY } from "src/shared/tokens";
import { IEpicRepository } from "./repositories/epic-repository.interface";

import type { DeepPartial } from "typeorm";
import type { EpicCollection, EpicImage } from "src/shared/providers/epic/models/epic-response.interface";
import type { EpicImageEntity } from "./entities/epic-image.entity";

const CACHE_TTL_SECONDS = 60 * 60 * 12;

export interface EpicImageDto extends EpicImage {
    archive_url: string;
}

@Injectable()
export class EpicService {
    private readonly logger = new Logger(EpicService.name);

    constructor(
        @Inject(EPIC_PROVIDER) private readonly epicProvider: IEpicProvider,
        @Inject(EPIC_REPOSITORY) private readonly epicRepository: IEpicRepository,
        @Inject(CACHE_PROVIDER) private readonly cacheProvider: ICacheProvider,
    ) {}

    async findLatest(collection: EpicCollection): Promise<EpicImageDto[]> {
        return await this.cacheProvider.getOrSet<EpicImageDto[]>(
            `epic:${collection}:latest`,
            CACHE_TTL_SECONDS,
            async () => {
                const images = await this.epicProvider.getLatest(collection);
                await this.persist(collection, images);

                return images.map((image) => this.toDto(collection, image));
            },
        );
    }

    async findByDate(collection: EpicCollection, date: string): Promise<EpicImageDto[]> {
        const images = await this.cacheProvider.getOrSet<EpicImageDto[]>(
            `epic:${collection}:date:${date}`,
            CACHE_TTL_SECONDS,
            async () => {
                const stored = await this.epicRepository.findByDate(collection, date);

                if (stored.length > 0) {
                    return stored.map((entity) => ({ ...entity.payload, archive_url: entity.archive_url }));
                }

                const fromApi = await this.epicProvider.getByDate(collection, date);
                await this.persist(collection, fromApi);

                return fromApi.map((image) => this.toDto(collection, image));
            },
        );

        if (images.length === 0) {
            throw new NotFoundException(`Nenhuma imagem ${collection} do EPIC em ${date}.`);
        }

        return images;
    }

    async findAvailableDates(collection: EpicCollection): Promise<string[]> {
        return await this.cacheProvider.getOrSet<string[]>(`epic:${collection}:dates`, CACHE_TTL_SECONDS, () =>
            this.epicProvider.getAvailableDates(collection),
        );
    }

    @ScheduledTask({ name: "epic:daily", cron: "0 8 * * *" })
    async syncLatest(): Promise<void> {
        for (const collection of ["natural", "enhanced"] as EpicCollection[]) {
            try {
                const images = await this.epicProvider.getLatest(collection);
                await this.persist(collection, images);
                this.logger.log(`${images.length} imagem(ns) ${collection} do EPIC sincronizada(s).`);
            } catch (error) {
                this.logger.warn(`Falha ao sincronizar o EPIC (${collection}): ${(error as Error).message}`);
            }
        }
    }

    private async persist(collection: EpicCollection, images: EpicImage[]): Promise<void> {
        if (images.length === 0) {
            return;
        }

        await this.epicRepository.upsertMany(images.map((image) => this.toEntity(collection, image)));
    }

    private toDto(collection: EpicCollection, image: EpicImage): EpicImageDto {
        return { ...image, archive_url: this.buildArchiveUrl(collection, image) };
    }

    private toEntity(collection: EpicCollection, image: EpicImage): DeepPartial<EpicImageEntity> {
        const capturedOn = this.extractDate(image.date);

        return {
            identifier: image.identifier,
            collection,
            captured_on: capturedOn,
            captured_at: new Date(`${image.date.replace(" ", "T")}Z`),
            image: image.image,
            archive_url: this.buildArchiveUrl(collection, image),
            payload: image,
        };
    }

    private buildArchiveUrl(collection: EpicCollection, image: EpicImage): string {
        return this.epicProvider.buildArchiveUrl(collection, this.extractDate(image.date), image.image);
    }

    private extractDate(date: string): string {
        return date.split(" ")[0];
    }
}
