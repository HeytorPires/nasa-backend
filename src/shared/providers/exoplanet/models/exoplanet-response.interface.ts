export const EXOPLANET_COLUMNS = [
    "pl_name",
    "hostname",
    "disc_year",
    "discoverymethod",
    "pl_orbper",
    "pl_rade",
    "pl_bmasse",
    "pl_eqt",
    "st_teff",
    "st_rad",
    "st_mass",
    "sy_dist",
] as const;

export type ExoplanetColumn = (typeof EXOPLANET_COLUMNS)[number];

export const EXOPLANET_TABLE = "pscomppars";

export type ExoplanetRow = Partial<Record<ExoplanetColumn, string | number | null>> & {
    pl_name: string;
};

export interface ExoplanetFilter {
    column: ExoplanetColumn;
    operator: "eq" | "gt" | "gte" | "lt" | "lte" | "like";
    value: string | number;
}

export interface ExoplanetQuery {
    filters: ExoplanetFilter[];
    limit: number;
    orderBy?: ExoplanetColumn;
    orderDirection?: "asc" | "desc";
}
