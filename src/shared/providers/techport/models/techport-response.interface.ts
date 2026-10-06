export interface TechportProjectRef {
    projectId: number;
    lastUpdated: string;
}

export interface TechportProjectsResponse {
    projects: TechportProjectRef[];
    totalCount: number;
}

export interface TechportProject {
    projectId: number;
    title: string;
    description?: string;
    benefits?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    lastUpdated?: string;
    [key: string]: unknown;
}

export interface TechportProjectResponse {
    project: TechportProject;
}
