import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { ApodEntity } from "../../entities/apod.entity";
import { IApodRepository } from "../apod-repository.interface";

@Injectable()
export class ApodRepository implements IApodRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByDate(date: Date): Promise<ApodEntity | null> {
        return await this.prisma.apod.findFirst({
            where: { date },
        });
    }
}
