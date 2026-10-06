import { redactApiKey } from "./sanitize.util";

describe("redactApiKey", () => {
    it("remove a chave de URLs aninhadas em objetos e arrays", () => {
        const payload = {
            links: { next: "http://api.nasa.gov/neo/rest/v1/feed?start_date=2024-05-02&api_key=SEGREDO" },
            objetos: [{ links: { self: "http://api.nasa.gov/neo/rest/v1/neo/1?api_key=SEGREDO" } }],
        };

        expect(redactApiKey(payload)).toEqual({
            links: { next: "http://api.nasa.gov/neo/rest/v1/feed?start_date=2024-05-02&api_key=REDACTED" },
            objetos: [{ links: { self: "http://api.nasa.gov/neo/rest/v1/neo/1?api_key=REDACTED" } }],
        });
    });

    it("preserva valores que não são string", () => {
        expect(redactApiKey({ a: 1, b: null, c: true })).toEqual({ a: 1, b: null, c: true });
    });

    it("não altera strings sem api_key", () => {
        expect(redactApiKey("https://example.com/x?y=1")).toBe("https://example.com/x?y=1");
    });
});
