import type { TechTransferCategory, TechTransferResult } from "./tech-transfer-response.interface";

export interface ITechTransferProvider {
    search(category: TechTransferCategory, term: string): Promise<TechTransferResult>;
}
