import { DataSource } from "typeorm";
import { TechTransferItemEntity } from "src/modules/tech-transfer/entities/tech-transfer-item.entity";
import { TypeOrmTechTransferRepository } from "src/modules/tech-transfer/repositories/typeorm/typeorm-tech-transfer.repository";
import { createTestDataSource, truncate } from "tests/support/database";

describe("TypeOrmTechTransferRepository (integração)", () => {
    let dataSource: DataSource;
    let repository: TypeOrmTechTransferRepository;

    beforeAll(async () => {
        dataSource = await createTestDataSource();
        repository = new TypeOrmTechTransferRepository(dataSource.getRepository(TechTransferItemEntity));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        await truncate(dataSource, ["tech_transfer_items"]);
    });

    function item(category: string, externalId: string) {
        return {
            category,
            external_id: externalId,
            case_number: "LEW-TOPS-168",
            title: "Closed Strayton Engine",
            description: "Gerador leve.",
            center: "GRC",
            payload: { id: externalId },
        };
    }

    it("o mesmo id em categorias diferentes convive na tabela", async () => {
        await repository.upsertMany([item("patent", "abc"), item("patent_issued", "abc")]);

        await expect(dataSource.getRepository(TechTransferItemEntity).count()).resolves.toBe(2);
    });

    it("repetir categoria e id atualiza em vez de duplicar", async () => {
        await repository.upsertMany([item("patent", "abc")]);
        await repository.upsertMany([{ ...item("patent", "abc"), title: "Título revisado" }]);

        const rows = await dataSource.getRepository(TechTransferItemEntity).find();

        expect(rows).toHaveLength(1);
        expect(rows[0].title).toBe("Título revisado");
    });

    it("aceita item sem número de caso, descrição ou centro", async () => {
        await repository.upsertMany([
            { ...item("software", "xyz"), case_number: null, description: null, center: null },
        ]);

        const [stored] = await dataSource.getRepository(TechTransferItemEntity).find();

        expect(stored).toMatchObject({ case_number: null, description: null, center: null });
    });
});
