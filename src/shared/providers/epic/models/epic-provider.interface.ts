import type { EpicCollection, EpicImage } from "./epic-response.interface";

export interface IEpicProvider {
    getLatest(collection: EpicCollection): Promise<EpicImage[]>;
    getByDate(collection: EpicCollection, date: string): Promise<EpicImage[]>;
    getAvailableDates(collection: EpicCollection): Promise<string[]>;
    buildArchiveUrl(collection: EpicCollection, date: string, image: string): string;
}
