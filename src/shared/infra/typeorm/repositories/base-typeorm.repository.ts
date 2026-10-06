import { DeepPartial, FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";

export abstract class BaseTypeOrmRepository<Entity extends ObjectLiteral> {
    constructor(protected readonly repository: Repository<Entity>) {}

    async create(data: DeepPartial<Entity>): Promise<Entity> {
        return await this.repository.save(this.repository.create(data));
    }

    async findOneBy(where: FindOptionsWhere<Entity>): Promise<Entity | null> {
        return await this.repository.findOne({ where });
    }

    async upsertByNaturalKey(
        conflictPaths: (keyof Entity & string)[],
        data: DeepPartial<Entity> | DeepPartial<Entity>[],
    ): Promise<void> {
        const rows = Array.isArray(data) ? data : [data];

        if (rows.length === 0) {
            return;
        }

        await this.repository.upsert(rows as never, {
            conflictPaths,
            skipUpdateIfNoValuesChanged: true,
        });
    }
}
