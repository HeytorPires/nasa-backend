import { Injectable } from "@nestjs/common";
import { Apod } from "src/generated/prisma/client";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { IApodRepository } from "../apod-repository.interface";

@Injectable()
export class ApodRepository implements IApodRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(apod: Apod): Promise<Apod> {
        return await this.prisma.apod.create({
            data: {
                date: apod.date,
                title: apod.title,
                explanation: apod.explanation,
                url: apod.url,
                media_type: apod.media_type,
                service_version: apod.service_version,
                created_at: apod.created_at,
            },
        });
    }

    async findByDate(date: Date): Promise<Apod | null> {
        return await this.prisma.apod.findFirst({
            where: { date },
        });
    }
    async findBetweenDates(startDate: Date, endDate: Date): Promise<Apod[]> {
        return await this.prisma.apod.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                date: "asc",
            },
        });
    }

    async countBetweenDates(startDate: Date, endDate: Date): Promise<number> {
        return await this.prisma.apod.count({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
    }
}
