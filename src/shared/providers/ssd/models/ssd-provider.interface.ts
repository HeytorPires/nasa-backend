import type {
    SsdCadQuery,
    SsdFireballQuery,
    SsdSentryQuery,
    SsdSentryResponse,
    SsdTableResponse,
} from "./ssd-response.interface";

export interface ISsdProvider {
    getCloseApproaches(query: SsdCadQuery): Promise<SsdTableResponse>;
    getFireballs(query: SsdFireballQuery): Promise<SsdTableResponse>;
    getSentry(query: SsdSentryQuery): Promise<SsdSentryResponse>;
    getNhats(): Promise<SsdTableResponse>;
    getScout(): Promise<unknown>;
    getMissionDesign(params: Record<string, string | number>): Promise<unknown>;
}
