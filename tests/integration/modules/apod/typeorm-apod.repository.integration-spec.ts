import { DataSource } from "typeorm";
import { ApodEntity } from "src/modules/apod/entities/apod.entity";
import { TypeOrmApodRepository } from "src/modules/apod/repositories/typeorm/typeorm-apod.repository";
import { createTestDataSource, truncate } from "tests/support/database";

describe("TypeOrmApodRepository (integração)", () => {
    let dataSource: DataSource;
    let repository: TypeOrmApodRepository;

    beforeAll(async () => {
        dataSource = await createTestDataSource();
        repository = new TypeOrmApodRepository(dataSource.getRepository(ApodEntity));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        await truncate(dataSource, ["apods"]);
    });

    function apod(date: string, overrides: Partial<ApodEntity> = {}) {
        return {
            date,
            title: `APOD de ${date}`,
            explanation: "Explicação",
            media_type: "image",
            url: `https://example.com/${date}.jpg`,
            ...overrides,
        };
    }

    describe("upsertMany", () => {
        it("insere e depois atualiza a mesma data em vez de violar o índice único", async () => {
            await repository.upsertMany([apod("2024-05-01")]);
            await repository.upsertMany([apod("2024-05-01", { title: "Título revisado" })]);

            const stored = await repository.findByDate("2024-05-01");

            expect(stored?.title).toBe("Título revisado");
            await expect(repository.countBetweenDates("2024-05-01", "2024-05-01")).resolves.toBe(1);
        });

        it("preenche created_at e updated_at vindos da BaseEntity", async () => {
            await repository.upsertMany([apod("2024-05-01")]);

            const stored = await repository.findByDate("2024-05-01");

            expect(stored?.id).toMatch(/^[0-9a-f-]{36}$/);
            expect(stored?.created_at).toBeInstanceOf(Date);
            expect(stored?.updated_at).toBeInstanceOf(Date);
        });

        it("grava as colunas opcionais da API WordPress", async () => {
            await repository.upsertMany([
                apod("2024-05-01", {
                    hdurl: "https://example.com/hd.jpg",
                    permalink: "https://science.nasa.gov/artigo",
                    copyright: "Fotógrafo",
                    alt: "Texto alternativo",
                }),
            ]);

            const stored = await repository.findByDate("2024-05-01");

            expect(stored).toMatchObject({
                hdurl: "https://example.com/hd.jpg",
                permalink: "https://science.nasa.gov/artigo",
                copyright: "Fotógrafo",
                alt: "Texto alternativo",
                service_version: null,
            });
        });

        it("não vai ao banco com lista vazia", async () => {
            await expect(repository.upsertMany([])).resolves.toBeUndefined();
        });
    });

    describe("consultas por intervalo", () => {
        beforeEach(async () => {
            await repository.upsertMany([apod("2024-05-01"), apod("2024-05-02"), apod("2024-05-10")]);
        });

        it("findBetweenDates inclui as duas pontas e ordena crescente", async () => {
            const result = await repository.findBetweenDates("2024-05-01", "2024-05-02");

            expect(result.map((entry) => entry.date)).toEqual(["2024-05-01", "2024-05-02"]);
        });

        it("countBetweenDates conta só o que está dentro do intervalo", async () => {
            await expect(repository.countBetweenDates("2024-05-01", "2024-05-05")).resolves.toBe(2);
        });

        it("findByDate devolve null para uma data ausente", async () => {
            await expect(repository.findByDate("2024-05-03")).resolves.toBeNull();
        });

        it("devolve a coluna date como string YYYY-MM-DD, não como Date", async () => {
            const stored = await repository.findByDate("2024-05-01");

            expect(stored?.date).toBe("2024-05-01");
        });
    });
});
