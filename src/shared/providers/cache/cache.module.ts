import { Module } from "@nestjs/common";
import { RedisCacheProvider } from "./implementation/redis-provider";

@Module({
    providers: [
        {
            provide: "CacheProvider",
            useClass: RedisCacheProvider,
        },
    ],
    exports: ["CacheProvider"],
})
export class CacheModule {}
