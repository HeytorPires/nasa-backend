import { Apod } from "src/generated/prisma/client";

export class ApodEntity implements Apod {
    id: string;
    date: Date;
    explanation: string;
    media_type: string;
    service_version: string;
    title: string;
    url: string;
    created_at: Date;
}
