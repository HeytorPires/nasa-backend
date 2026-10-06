import { createTestApp, TestApp } from "tests/support/test-app";

describe("Health (e2e)", () => {
    let context: TestApp;

    beforeAll(async () => {
        context = await createTestApp();
    });

    afterAll(async () => {
        await context.close();
    });

    it("responde ok fora do versionamento /v1", async () => {
        const response = await context.http().get("/health").expect(200);

        expect(response.body).toEqual({ status: "ok" });
    });

    it("responde 503 quando o Redis não responde", async () => {
        jest.spyOn(context.cache, "ping").mockRejectedValueOnce(new Error("ECONNREFUSED"));

        await context.http().get("/health").expect(503);
    });
});
