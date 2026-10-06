import { Module } from "@nestjs/common";
import { CACHE_PROVIDER } from "src/shared/tokens";
import { RedisCacheProvider } from "./implementation/redis-provider";

@Module({
    providers: [
        {
            provide: CACHE_PROVIDER,
            useClass: RedisCacheProvider,
        },
    ],
    exports: [CACHE_PROVIDER],
})
export class CacheModule {}
