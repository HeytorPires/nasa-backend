import { Controller, Get, HttpCode, HttpStatus, Inject, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { DataSource } from "typeorm";
import type { ICacheProvider } from "src/shared/providers/cache/models/cache-provider.interface";
import { CACHE_PROVIDER } from "src/shared/tokens";

export const HEALTH_CHECK_TIMEOUT_MS = 3000;

export interface HealthResponse {
    status: "ok";
}

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
    let timer: NodeJS.Timeout | undefined;

    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(
            () => reject(new Error(`${label} não respondeu em ${HEALTH_CHECK_TIMEOUT_MS}ms`)),
            HEALTH_CHECK_TIMEOUT_MS,
        );
    });

    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

@ApiExcludeController()
@Controller("health")
export class HealthController {
    private readonly logger = new Logger(HealthController.name);

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_PROVIDER)
        private readonly cacheProvider: ICacheProvider,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async check(): Promise<HealthResponse> {
        try {
            await Promise.all([
                withTimeout(this.dataSource.query("SELECT 1"), "Postgres"),
                withTimeout(this.cacheProvider.ping(), "Redis"),
            ]);
        } catch (error) {
            this.logger.error(`Health check falhou: ${(error as Error).message}`);
            throw new ServiceUnavailableException("Postgres ou Redis indisponível");
        }

        return { status: "ok" };
    }
}
