const API_KEY_PATTERN = /([?&]api_key=)[^&"\s]+/gi;

export function redactApiKey<T>(value: T): T {
    return walk(value) as T;
}

function walk(value: unknown): unknown {
    if (typeof value === "string") {
        return value.replace(API_KEY_PATTERN, "$1REDACTED");
    }

    if (Array.isArray(value)) {
        return value.map(walk);
    }

    if (value !== null && typeof value === "object") {
        const result: Record<string, unknown> = {};

        for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
            result[key] = walk(nested);
        }

        return result;
    }

    return value;
}
