import { DataSource } from "typeorm";
import { TechportProjectEntity } from "src/modules/techport/entities/techport-project.entity";
import { TypeOrmTechportRepository } from "src/modules/techport/repositories/typeorm/typeorm-techport.repository";
import { createTestDataSource, truncate } from "tests/support/database";

describe("TypeOrmTechportRepository (integração)", () => {
    let dataSource: DataSource;
    let repository: TypeOrmTechportRepository;

    beforeAll(async () => {
        dataSource = await createTestDataSource();
        repository = new TypeOrmTechportRepository(dataSource.getRepository(TechportProjectEntity));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        await truncate(dataSource, ["techport_projects"]);
    });

    it("a listagem grava só o resumo, com payload nulo", async () => {
        await repository.upsertMany([{ project_id: 93851, last_updated: "2026-09-10" }]);

        const stored = await repository.findByProjectId(93851);

        expect(stored).toMatchObject({ project_id: 93851, payload: null, last_updated: "2026-09-10" });
    });

    it("o detalhe posterior enriquece a mesma linha", async () => {
        await repository.upsertMany([{ project_id: 93851, last_updated: "2026-09-10" }]);
        await repository.upsertMany([
            {
                project_id: 93851,
                title: "Projeto",
                status: "Active",
                last_updated: "2026-09-10",
                payload: { projectId: 93851, title: "Projeto" },
            },
        ]);

        const stored = await repository.findByProjectId(93851);

        expect(stored?.payload).toMatchObject({ title: "Projeto" });
        await expect(dataSource.getRepository(TechportProjectEntity).count()).resolves.toBe(1);
    });

    it("findLastUpdatedDate devolve a data mais recente, usada como updatedSince do cron", async () => {
        await repository.upsertMany([
            { project_id: 1, last_updated: "2026-01-01" },
            { project_id: 2, last_updated: "2026-09-10" },
            { project_id: 3, last_updated: "2026-05-01" },
        ]);

        await expect(repository.findLastUpdatedDate()).resolves.toBe("2026-09-10");
    });

    it("findLastUpdatedDate devolve null com a tabela vazia", async () => {
        await expect(repository.findLastUpdatedDate()).resolves.toBeNull();
    });

    it("findByProjectId devolve null para projeto desconhecido", async () => {
        await expect(repository.findByProjectId(999999)).resolves.toBeNull();
    });
});
