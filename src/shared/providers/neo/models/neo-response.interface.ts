export interface NeoEstimatedDiameterRange {
    estimated_diameter_min: number;
    estimated_diameter_max: number;
}

export interface NeoCloseApproach {
    close_approach_date: string;
    close_approach_date_full: string | null;
    epoch_date_close_approach: number;
    relative_velocity: Record<string, string>;
    miss_distance: Record<string, string>;
    orbiting_body: string;
}

export interface NeoObject {
    id: string;
    neo_reference_id: string;
    name: string;
    nasa_jpl_url: string;
    absolute_magnitude_h: number;
    estimated_diameter: Record<string, NeoEstimatedDiameterRange>;
    is_potentially_hazardous_asteroid: boolean;
    is_sentry_object: boolean;
    close_approach_data: NeoCloseApproach[];
}

export interface NeoFeedResponse {
    element_count: number;
    near_earth_objects: Record<string, NeoObject[]>;
}

export interface NeoBrowseResponse {
    page: {
        size: number;
        total_elements: number;
        total_pages: number;
        number: number;
    };
    near_earth_objects: NeoObject[];
}
