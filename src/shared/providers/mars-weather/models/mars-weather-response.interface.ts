export interface MarsSensorSummary {
    av: number;
    ct: number;
    mn: number;
    mx: number;
}

export interface MarsSolSummary {
    AT?: MarsSensorSummary;
    HWS?: MarsSensorSummary;
    PRE?: MarsSensorSummary;
    WD?: Record<string, unknown>;
    First_UTC: string;
    Last_UTC: string;
    Season: string;
    Northern_season?: string;
    Southern_season?: string;
    Month_ordinal?: number;
}

export type MarsWeatherResponse = Record<string, unknown> & {
    sol_keys: string[];
    validity_checks?: unknown;
};
