export interface EonetCategoryRef {
    id: string;
    title: string;
}

export interface EonetSourceRef {
    id: string;
    url: string;
}

export interface EonetGeometry {
    date: string;
    type: string;
    coordinates: unknown;
    magnitudeValue?: number | null;
    magnitudeUnit?: string | null;
}

export interface EonetEvent {
    id: string;
    title: string;
    description: string | null;
    link: string;
    closed: string | null;
    categories: EonetCategoryRef[];
    sources: EonetSourceRef[];
    geometry: EonetGeometry[];
}

export interface EonetCategory {
    id: string;
    title: string;
    link: string;
    description: string;
    layers: string;
}

export interface EonetSource {
    id: string;
    title: string;
    source: string;
    link: string;
}

export interface EonetCollection<T> {
    title: string;
    description: string;
    link: string;
    events?: T[];
    categories?: T[];
    sources?: T[];
    layers?: T[];
}
