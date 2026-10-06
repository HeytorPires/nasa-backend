import type { TechportProject, TechportProjectsResponse } from "./techport-response.interface";

export interface ITechportProvider {
    listProjects(updatedSince: string): Promise<TechportProjectsResponse>;
    getProject(projectId: number): Promise<TechportProject>;
}
