import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ObjectValues } from "src/utils/types";

export const ENV_VARIABLE = {
    JWT_SECRET: "JWT_SECRET",
    JWT_EXPIRES_IN: "JWT_EXPIRES_IN",
    PORT: "PORT",
    NASA_API_KEY: "NASA_API_KEY",
    DB_HOST: "DB_HOST",
    DB_PORT: "DB_PORT",
    DB_USERNAME: "DB_USERNAME",
    DB_NAME: "DB_NAME",
    REDIS_HOST: "REDIS_HOST",
    REDIS_PORT: "REDIS_PORT",
} as const;

export type EnvVariable = ObjectValues<typeof ENV_VARIABLE>;

@Injectable()
export class EnvConfigService {
    constructor(private readonly configService: ConfigService<typeof ENV_VARIABLE, true>) {
        this.checkEnvironment();
    }

    get(envName: EnvVariable): string {
        return this.configService.get(envName);
    }

    private checkEnvironment(): void {
        const missingsEnvs: string[] = [];

        for (const key of Object.values(ENV_VARIABLE)) {
            if (!this.get(key)) {
                missingsEnvs.push(key);
            }
        }

        if (missingsEnvs.length > 0) {
            throw new Error(`Missing environment variables: ${missingsEnvs.join(", ")}`);
        }
    }
}
