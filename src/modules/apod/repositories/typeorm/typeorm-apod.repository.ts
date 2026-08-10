import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { ApodEntity } from "../../entities/apod.entity";
import { IApodRepository } from "../apod-repository.interface";

@Injectable()
export class TypeOrmApodRepository implements IApodRepository {
    constructor(
        @InjectRepository(ApodEntity)
        private readonly apodRepository: Repository<ApodEntity>,
    ) {}

    async create(apod: Partial<ApodEntity>): Promise<ApodEntity> {
        const newApod = this.apodRepository.create(apod);
        return await this.apodRepository.save(newApod);
    }

    async findByDate(date: Date): Promise<ApodEntity | null> {
        return await this.apodRepository.findOne({
            where: { date },
        });
    }

    async findBetweenDates(startDate: Date, endDate: Date): Promise<ApodEntity[]> {
        return await this.apodRepository.find({
            where: {
                date: Between(startDate, endDate),
            },
            order: {
                date: "ASC",
            },
        });
    }

    async countBetweenDates(startDate: Date, endDate: Date): Promise<number> {
        return await this.apodRepository.count({
            where: {
                date: Between(startDate, endDate),
            },
        });
    }
}
