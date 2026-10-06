import { Test, TestingModule } from "@nestjs/testing";
import { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { ITechportProvider } from "src/shared/providers/techport/models/techport-provider.interface";
import { createCacheProviderMock } from "src/shared/testing/cache-provider.mock";
import { CACHE_PROVIDER, TECHPORT_PROVIDER, TECHPORT_REPOSITORY } from "src/shared/tokens";
import { TechportProjectEntity } from "./entities/techport-project.entity";
import { ITechportRepository } from "./repositories/techport-repository.interface";
import { TechportService } from "./techport.service";

describe("TechportService", () => {
    let service: TechportService;
    let techportProvider: jest.Mocked<ITechportProvider>;
    let techportRepository: jest.Mocked<ITechportRepository>;
    let cacheProvider: jest.Mocked<ICacheProvider>;

    beforeEach(async () => {
        techportProvider = { listProjects: jest.fn(), getProject: jest.fn() };
        techportRepository = {
            findByProjectId: jest.fn(),
            findLastUpdatedDate: jest.fn(),
            upsertMany: jest.fn(),
        };
        cacheProvider = createCacheProviderMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TechportService,
                { provide: TECHPORT_PROVIDER, useValue: techportProvider },
                { provide: TECHPORT_REPOSITORY, useValue: techportRepository },
                { provide: CACHE_PROVIDER, useValue: cacheProvider },
            ],
        }).compile();

        service = module.get<TechportService>(TechportService);
    });

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("normaliza a data YYYY-M-D do upstream para YYYY-MM-DD", async () => {
        techportProvider.listProjects.mockResolvedValueOnce({
            projects: [{ projectId: 93851, lastUpdated: "2026-9-10" }],
            totalCount: 1,
        });

        await service.listProjects("2024-01-01");

        expect(techportRepository.upsertMany).toHaveBeenCalledWith([{ project_id: 93851, last_updated: "2026-09-10" }]);
    });

    it("busca o detalhe no upstream quando o banco só tem o resumo da listagem", async () => {
        techportRepository.findByProjectId.mockResolvedValueOnce({
            project_id: 93851,
            payload: null,
        } as TechportProjectEntity);
        techportProvider.getProject.mockResolvedValueOnce({ projectId: 93851, title: "Projeto" });

        await expect(service.findProject(93851)).resolves.toMatchObject({ title: "Projeto" });
        expect(techportProvider.getProject).toHaveBeenCalled();
    });

    it("devolve o detalhe do banco sem chamar o upstream", async () => {
        techportRepository.findByProjectId.mockResolvedValueOnce({
            project_id: 93851,
            payload: { projectId: 93851, title: "Do banco" },
        } as TechportProjectEntity);

        await expect(service.findProject(93851)).resolves.toMatchObject({ title: "Do banco" });
        expect(techportProvider.getProject).not.toHaveBeenCalled();
    });

    it("syncRecentProjects parte da última data registrada", async () => {
        techportRepository.findLastUpdatedDate.mockResolvedValueOnce("2026-01-01");
        techportProvider.listProjects.mockResolvedValueOnce({ projects: [], totalCount: 0 });

        await service.syncRecentProjects();

        expect(techportProvider.listProjects).toHaveBeenCalledWith("2026-01-01");
    });
});
