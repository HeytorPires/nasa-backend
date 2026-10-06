export interface ICacheProvider {
    save(key: string, value: unknown, ttl?: number): Promise<void>;
    recover<T>(key: string): Promise<T | null>;
    invalidate(key: string): Promise<void>;
    invalidatePrefix(prefix: string): Promise<void>;
    getOrSet<T>(key: string, ttl: number, factory: () => Promise<T>): Promise<T>;
}
