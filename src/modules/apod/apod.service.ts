import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ApodService {
    constructor(private readonly prisma: PrismaService) {}
    async findByDate(date: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await this.prisma.apod.findUnique({
            where: { date },
        });
    }
}
