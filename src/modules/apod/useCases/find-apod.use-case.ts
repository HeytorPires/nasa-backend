import { Injectable } from "@nestjs/common";

@Injectable()
export class ApodService {
    findAll() {
        return `This action returns all apod`;
    }

    findOne(id: number) {
        return `This action returns a #${id} apod`;
    }
}
