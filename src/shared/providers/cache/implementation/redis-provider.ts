import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { ICacheProvider } from "../models/cache-provider.interface";

@Injectable()
export class RedisCacheProvider implements ICacheProvider, OnModuleDestroy {
    private readonly client: Redis;

    constructor(private readonly configService: ConfigService) {
        this.client = new Redis({
            host: this.configService.get<string>("REDIS_HOST"),
            port: this.configService.get<number>("REDIS_PORT"),
        });
    }

    async onModuleDestroy(): Promise<void> {
        await this.client.quit();
    }

    async save(key: string, value: any, ttl?: number): Promise<void> {
        const stringValue = JSON.stringify(value);
        if (ttl) {
            await this.client.setex(key, ttl, stringValue);
        } else {
            await this.client.set(key, stringValue);
        }
    }

    async recover<T>(key: string): Promise<T | null> {
        const value = await this.client.get(key);
        return value ? (JSON.parse(value) as T) : null;
    }

    async invalidate(key: string): Promise<void> {
        await this.client.del(key);
    }

    async invalidatePrefix(prefix: string): Promise<void> {
        const keys = await this.client.keys(`${prefix}*`);
        if (keys.length > 0) {
            await this.client.del(...keys);
        }
    }
}
