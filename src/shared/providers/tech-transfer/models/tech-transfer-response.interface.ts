export const TECH_TRANSFER_CATEGORIES = ["patent", "patent_issued", "software", "spinoff"] as const;
export type TechTransferCategory = (typeof TECH_TRANSFER_CATEGORIES)[number];

export interface TechTransferItem {
    id: string;
    case_number: string;
    title: string;
    description: string;
    category: string;
    center: string;
    image_url: string | null;
}

export interface TechTransferResult {
    results: TechTransferItem[];
    count: number;
    total: number;
    page: number;
    perpage: number;
}
