import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ENV_VARIABLE, EnvConfigService } from "./env-config.service";

describe("EnvConfigService", () => {
    let service: EnvConfigService;
    let configService: ConfigService;

    const mockEnvValues: Record<string, string> = {
        PORT: "3000",
        NASA_API_KEY: "test-api-key",
        DB_HOST: "localhost",
        DB_PORT: "5432",
        DB_USERNAME: "postgres",
        DB_PASSWORD: "postgres",
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

    afterEach(() => jest.clearAllMocks());

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("get", () => {
        it("devolve o valor de cada variável declarada em ENV_VARIABLE", () => {
            for (const key of Object.values(ENV_VARIABLE)) {
                expect(service.get(key)).toBe(mockEnvValues[key]);
            }
        });

        it("repassa a chave para o ConfigService", () => {
            service.get(ENV_VARIABLE.PORT);
            expect(configService.get).toHaveBeenCalledWith(ENV_VARIABLE.PORT);
        });
    });

    describe("checkEnvironment", () => {
        it("lista todas as variáveis faltantes na mensagem de erro", async () => {
            const incompleteEnvValues: Record<string, string> = {
                ...mockEnvValues,
                NASA_API_KEY: "",
                DB_PASSWORD: "",
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
            ).rejects.toThrow("Missing environment variables: NASA_API_KEY, DB_PASSWORD");
        });

        it("não lança quando todas as variáveis estão presentes", () => {
            expect(() => service).not.toThrow();
        });
    });
});
