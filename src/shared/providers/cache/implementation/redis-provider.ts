import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { ICacheProvider } from "../models/cache-provider.interface";

const SCAN_BATCH_SIZE = 500;

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

    async save(key: string, value: unknown, ttl?: number): Promise<void> {
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

    async ping(): Promise<void> {
        await this.client.ping();
    }

    async invalidate(key: string): Promise<void> {
        await this.client.del(key);
    }

    async invalidatePrefix(prefix: string): Promise<void> {
        let cursor = "0";

        do {
            const [nextCursor, keys] = await this.client.scan(cursor, "MATCH", `${prefix}*`, "COUNT", SCAN_BATCH_SIZE);
            cursor = nextCursor;

            if (keys.length > 0) {
                await this.client.unlink(...keys);
            }
        } while (cursor !== "0");
    }

    async getOrSet<T>(key: string, ttl: number, factory: () => Promise<T>): Promise<T> {
        const cached = await this.recover<T>(key);

        if (cached !== null) {
            return cached;
        }

        const value = await factory();

        if (value !== null && value !== undefined) {
            await this.save(key, value, ttl);
        }

        return value;
    }
}
