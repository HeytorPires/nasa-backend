import { Inject, Injectable } from "@nestjs/common";
import { EnvConfigService } from "src/env-config/env-config.service";
import { UpstreamHttpProvider } from "src/shared/providers/base/upstream-http.provider";
import { HTTP_CLIENT_PROVIDER } from "src/shared/tokens";

import type { IHttpClientProvider } from "src/shared/providers/http/models/http-client-provider.interface";
import type { ITechTransferProvider } from "../models/tech-transfer-provider.interface";
import type {
    TechTransferCategory,
    TechTransferItem,
    TechTransferResult,
} from "../models/tech-transfer-response.interface";

const COLUMN = {
    id: 0,
    caseNumber: 1,
    title: 2,
    description: 3,
    category: 5,
    center: 9,
    imageUrl: 10,
} as const;

interface RawTechTransferResponse {
    results: unknown[][];
    count: number;
    total: number;
    page: number;
    perpage: number;
}

@Injectable()
export class TechTransferProvider extends UpstreamHttpProvider implements ITechTransferProvider {
    protected readonly baseUrl = "https://technology.nasa.gov/api/query";
    protected readonly context = "NASA TechTransfer";
    protected readonly requiresApiKey = false;

    constructor(@Inject(HTTP_CLIENT_PROVIDER) httpClient: IHttpClientProvider, envConfigService: EnvConfigService) {
        super(httpClient, envConfigService);
    }

    async search(category: TechTransferCategory, term: string): Promise<TechTransferResult> {
        const response = await this.request<RawTechTransferResponse>(`/${category}/${encodeURIComponent(term)}`);

        return {
            results: (response.results ?? []).map((row) => this.toItem(row)),
            count: response.count ?? 0,
            total: response.total ?? 0,
            page: response.page ?? 1,
            perpage: response.perpage ?? 0,
        };
    }

    private toItem(row: unknown[]): TechTransferItem {
        return {
            id: this.text(row[COLUMN.id]),
            case_number: this.text(row[COLUMN.caseNumber]),
            title: this.stripHighlight(this.text(row[COLUMN.title])),
            description: this.stripHighlight(this.text(row[COLUMN.description])),
            category: this.text(row[COLUMN.category]),
            center: this.text(row[COLUMN.center]),
            image_url: this.text(row[COLUMN.imageUrl]) || null,
        };
    }

    private text(value: unknown): string {
        return typeof value === "string" ? value : "";
    }

    private stripHighlight(value: string): string {
        return value.replace(/<\/?span[^>]*>/g, "");
    }
}
