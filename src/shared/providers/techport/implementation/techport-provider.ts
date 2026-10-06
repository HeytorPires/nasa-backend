import { Inject, Injectable } from "@nestjs/common";
import { EnvConfigService } from "src/env-config/env-config.service";
import { UpstreamHttpProvider } from "src/shared/providers/base/upstream-http.provider";
import { HTTP_CLIENT_PROVIDER } from "src/shared/tokens";

import type { IHttpClientProvider } from "src/shared/providers/http/models/http-client-provider.interface";
import type { ITechportProvider } from "../models/techport-provider.interface";
import type {
    TechportProject,
    TechportProjectResponse,
    TechportProjectsResponse,
} from "../models/techport-response.interface";

@Injectable()
export class TechportProvider extends UpstreamHttpProvider implements ITechportProvider {
    protected readonly baseUrl = "https://techport.nasa.gov/api";
    protected readonly context = "NASA TechPort";
    protected readonly requiresApiKey = false;

    constructor(@Inject(HTTP_CLIENT_PROVIDER) httpClient: IHttpClientProvider, envConfigService: EnvConfigService) {
        super(httpClient, envConfigService);
    }

    async listProjects(updatedSince: string): Promise<TechportProjectsResponse> {
        return await this.request<TechportProjectsResponse>("/projects", { updatedSince });
    }

    async getProject(projectId: number): Promise<TechportProject> {
        const response = await this.request<TechportProjectResponse & TechportProject>(`/projects/${projectId}`);

        return response.project ?? response;
    }
}
