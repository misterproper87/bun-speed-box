import { Database } from "bun:sqlite";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { app } from "../src/index";

// Use an in-memory database for tests so we don't touch db.sqlite
const sqlite = new Database(":memory:");
const testDb = drizzle(sqlite);

beforeAll(async () => {
  migrate(testDb, { migrationsFolder: "./migrations" });
  process.env.DATABASE_URL = ":memory:";
});

afterAll(async () => {
  sqlite.close();
  await app.stop();
});

describe("GET /", () => {
  it("returns service info", async () => {
    const res = await app.handle(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("bun-speed-box");
  });
});

describe("POST /shorten", () => {
  it("shortens a valid URL", async () => {
    const res = await app.handle(
      new Request("http://localhost/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com" }),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.code).toHaveLength(7);
    expect(data.shortUrl).toContain(data.code);
  });

  it("rejects an invalid URL", async () => {
    const res = await app.handle(
      new Request("http://localhost/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "not-a-url" }),
      }),
    );
    expect(res.status).toBe(422);
  });
});

describe("GET /:code", () => {
  it("redirects to the original URL", async () => {
    const shortenRes = await app.handle(
      new Request("http://localhost/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://bun.sh" }),
      }),
    );
    const { code } = await shortenRes.json();

    const res = await app.handle(new Request(`http://localhost/${code}`));
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://bun.sh");
  });

  it("returns 404 for an unknown code", async () => {
    const res = await app.handle(new Request("http://localhost/xxxxxxx"));
    expect(res.status).toBe(404);
  });
});

describe("GET /stats/:code", () => {
  it("tracks visits after redirects", async () => {
    const shortenRes = await app.handle(
      new Request("http://localhost/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://elysiajs.com" }),
      }),
    );
    const { code } = await shortenRes.json();

    await app.handle(new Request(`http://localhost/${code}`));
    await app.handle(new Request(`http://localhost/${code}`));

    const statsRes = await app.handle(new Request(`http://localhost/stats/${code}`));
    expect(statsRes.status).toBe(200);
    const stats = await statsRes.json();
    expect(stats.visits).toBe(2);
    expect(stats.url).toBe("https://elysiajs.com");
  });

  it("returns 404 for unknown code", async () => {
    const res = await app.handle(new Request("http://localhost/stats/xxxxxxx"));
    expect(res.status).toBe(404);
  });
});
