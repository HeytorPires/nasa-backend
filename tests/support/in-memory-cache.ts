import type { ICacheProvider } from "../../src/shared/providers/cache/models/cache-provider.interface";

export class InMemoryCache implements ICacheProvider {
    private readonly store = new Map<string, unknown>();

    save(key: string, value: unknown): Promise<void> {
        this.store.set(key, value);
        return Promise.resolve();
    }

    recover<T>(key: string): Promise<T | null> {
        return Promise.resolve((this.store.get(key) as T) ?? null);
    }

    invalidate(key: string): Promise<void> {
        this.store.delete(key);
        return Promise.resolve();
    }

    invalidatePrefix(prefix: string): Promise<void> {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
            }
        }

        return Promise.resolve();
    }

    async getOrSet<T>(key: string, _ttl: number, factory: () => Promise<T>): Promise<T> {
        const cached = await this.recover<T>(key);

        if (cached !== null) {
            return cached;
        }

        const value = await factory();

        if (value !== null && value !== undefined) {
            await this.save(key, value);
        }

        return value;
    }

    ping(): Promise<void> {
        return Promise.resolve();
    }

    clear(): void {
        this.store.clear();
    }
}
