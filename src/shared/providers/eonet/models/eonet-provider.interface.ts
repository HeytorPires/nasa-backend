import type { EonetCategory, EonetEvent, EonetSource } from "./eonet-response.interface";

export interface EonetEventsQuery {
    status?: string;
    category?: string;
    days?: number;
    limit?: number;
    source?: string;
}

export interface IEonetProvider {
    getEvents(query: EonetEventsQuery): Promise<EonetEvent[]>;
    getCategories(): Promise<EonetCategory[]>;
    getSources(): Promise<EonetSource[]>;
    getLayers(category?: string): Promise<unknown>;
}
