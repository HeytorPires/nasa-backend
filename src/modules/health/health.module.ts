import { Module } from "@nestjs/common";
import { CacheModule } from "src/shared/providers/cache/cache.module";
import { HealthController } from "./health.controller";

@Module({
    imports: [CacheModule],
    controllers: [HealthController],
})
export class HealthModule {}
