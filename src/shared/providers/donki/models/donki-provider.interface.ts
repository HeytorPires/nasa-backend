import type { DonkiEvent, DonkiEventType, DonkiQuery } from "./donki-response.interface";

export interface IDonkiProvider {
    getEvents(eventType: DonkiEventType, query: DonkiQuery): Promise<DonkiEvent[]>;
}
