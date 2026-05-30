import { PrismaService } from "./prisma.service";

jest.mock("@prisma/adapter-pg", () => {
    return {
        PrismaPg: jest.fn().mockImplementation(() => ({})),
    };
});

jest.mock("../../generated/prisma/client", () => {
    return {
        PrismaClient: class {
            $connect = jest.fn();
            $disconnect = jest.fn();
        },
    };
});

describe("PrismaService", () => {
    let service: PrismaService;

    beforeEach(() => {
        process.env.DB_USERNAME = "test-user";
        process.env.DB_PASSWORD = "test-pass";
        process.env.DB_HOST = "localhost";
        process.env.DB_PORT = "5432";
        process.env.DB_NAME = "test-db";

        service = new PrismaService();
    });

    afterEach(() => {
        delete process.env.DB_USERNAME;
        delete process.env.DB_PASSWORD;
        delete process.env.DB_HOST;
        delete process.env.DB_PORT;
        delete process.env.DB_NAME;
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should be an instance of PrismaService", () => {
        expect(service).toBeInstanceOf(PrismaService);
    });
});
