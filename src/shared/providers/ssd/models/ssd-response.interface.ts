export interface SsdTableResponse {
    signature?: { source: string; version: string };
    count: number | string;
    fields: string[];
    data: string[][];
}

export interface SsdSentryResponse {
    signature?: { source: string; version: string };
    count: number | string;
    data: Record<string, unknown>[];
}

export interface SsdCadQuery {
    dateMin?: string;
    dateMax?: string;
    distMax?: string;
    body?: string;
    sort?: string;
    limit?: number;
}

export interface SsdFireballQuery {
    dateMin?: string;
    dateMax?: string;
    limit?: number;
}

export interface SsdSentryQuery {
    des?: string;
    ipMin?: number;
    limit?: number;
}
