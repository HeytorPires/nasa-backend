export const EPIC_COLLECTIONS = ["natural", "enhanced"] as const;
export type EpicCollection = (typeof EPIC_COLLECTIONS)[number];

export interface EpicCoordinates {
    lat: number;
    lon: number;
}

export interface EpicVector {
    x: number;
    y: number;
    z: number;
}

export interface EpicImage {
    identifier: string;
    caption: string;
    image: string;
    version: string;
    date: string;
    centroid_coordinates: EpicCoordinates;
    dscovr_j2000_position: EpicVector;
    lunar_j2000_position: EpicVector;
    sun_j2000_position: EpicVector;
    attitude_quaternions: Record<string, number>;
}

export interface EpicAvailableDate {
    date: string;
}
