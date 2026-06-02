import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { EnvConfigService, ENV_VARIABLE } from "./env-config.service";

describe("EnvConfigService", () => {
    let service: EnvConfigService;
    let configService: ConfigService;

    const mockEnvValues: Record<string, string> = {
        JWT_SECRET: "test-secret",
        JWT_EXPIRES_IN: "3600",
        PORT: "3000",
        NASA_API_KEY: "test-api-key",
        DB_HOST: "localhost",
        DB_PORT: "5432",
        DB_USERNAME: "postgres",
        DB_NAME: "nasa_db",
        REDIS_HOST: "localhost",
        REDIS_PORT: "6379",
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EnvConfigService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => mockEnvValues[key]),
                    },
                },
            ],
        }).compile();

        service = module.get<EnvConfigService>(EnvConfigService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("get", () => {
        it("should return the value for a given environment variable", () => {
            expect(service.get(ENV_VARIABLE.PORT)).toBe("3000");
            expect(service.get(ENV_VARIABLE.NASA_API_KEY)).toBe("test-api-key");
            expect(service.get(ENV_VARIABLE.JWT_SECRET)).toBe("test-secret");
            expect(service.get(ENV_VARIABLE.JWT_EXPIRES_IN)).toBe("3600");
            expect(service.get(ENV_VARIABLE.DB_HOST)).toBe("localhost");
            expect(service.get(ENV_VARIABLE.DB_PORT)).toBe("5432");
            expect(service.get(ENV_VARIABLE.DB_USERNAME)).toBe("postgres");
            expect(service.get(ENV_VARIABLE.DB_NAME)).toBe("nasa_db");
            expect(service.get(ENV_VARIABLE.REDIS_HOST)).toBe("localhost");
            expect(service.get(ENV_VARIABLE.REDIS_PORT)).toBe("6379");
        });

        it("should call configService.get with the correct key", () => {
            service.get(ENV_VARIABLE.PORT);
            expect(configService.get).toHaveBeenCalledWith(ENV_VARIABLE.PORT);
        });
    });

    describe("checkEnvironment", () => {
        it("should throw an error if any environment variable is missing", async () => {
            const incompleteEnvValues: Record<string, string> = {
                JWT_SECRET: "test-secret",
                JWT_EXPIRES_IN: "",
                PORT: "3000",
                NASA_API_KEY: "",
            };

            await expect(
                Test.createTestingModule({
                    providers: [
                        EnvConfigService,
                        {
                            provide: ConfigService,
                            useValue: {
                                get: jest.fn((key: string) => incompleteEnvValues[key]),
                            },
                        },
                    ],
                }).compile(),
            ).rejects.toThrow("Missing environment variables: JWT_EXPIRES_IN, NASA_API_KEY");
        });

        it("should not throw when all environment variables are present", () => {
            expect(() => service).not.toThrow();
        });
    });
});
