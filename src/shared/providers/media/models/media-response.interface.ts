export const MEDIA_TYPES = ["image", "video", "audio"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export interface MediaItemData {
    nasa_id: string;
    title: string;
    description?: string;
    media_type: string;
    date_created: string;
    center?: string;
    keywords?: string[];
}

export interface MediaItemLink {
    href: string;
    rel: string;
    render?: string;
}

export interface MediaItem {
    href: string;
    data: MediaItemData[];
    links?: MediaItemLink[];
}

export interface MediaSearchResponse {
    collection: {
        version: string;
        href: string;
        items: MediaItem[];
        metadata: { total_hits: number };
        links?: { href: string; rel: string; prompt?: string }[];
    };
}

export interface MediaAssetResponse {
    collection: {
        version: string;
        href: string;
        items: { href: string }[];
    };
}
