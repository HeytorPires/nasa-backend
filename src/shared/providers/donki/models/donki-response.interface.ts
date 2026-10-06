export const DONKI_EVENT_PATHS = {
    cme: "CME",
    "cme-analysis": "CMEAnalysis",
    gst: "GST",
    ips: "IPS",
    flr: "FLR",
    sep: "SEP",
    mpc: "MPC",
    rbe: "RBE",
    hss: "HSS",
    "wsa-enlil": "WSAEnlilSimulations",
    notifications: "notifications",
} as const;

export const DONKI_EVENT_TYPES = Object.keys(DONKI_EVENT_PATHS) as DonkiEventType[];

export type DonkiEventType = keyof typeof DONKI_EVENT_PATHS;

export type DonkiEvent = Record<string, unknown>;

export interface DonkiQuery {
    startDate?: string;
    endDate?: string;
    mostAccurateOnly?: boolean;
    speed?: number;
    halfAngle?: number;
    catalog?: string;
    location?: string;
    type?: string;
}
