export interface TleRecord {
    satelliteId: number;
    name: string;
    date: string;
    line1: string;
    line2: string;
}

export interface TleCollection {
    totalItems: number;
    member: TleRecord[];
}
