import type { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";

export function createCacheProviderMock(): jest.Mocked<ICacheProvider> {
    return {
        save: jest.fn(),
        recover: jest.fn(),
        invalidate: jest.fn(),
        invalidatePrefix: jest.fn(),
        getOrSet: jest.fn(async (_key: string, _ttl: number, factory: () => Promise<unknown>) => factory()),
    } as unknown as jest.Mocked<ICacheProvider>;
}
