import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

const url = process.env.DATABASE_URL ?? "db.sqlite";
const sqlite = new Database(url);
sqlite.exec("PRAGMA journal_mode = WAL;");

const db = drizzle(sqlite);

console.log(`Running migrations on ${url}...`);
migrate(db, { migrationsFolder: "./migrations" });
console.log("Migrations applied successfully.");

sqlite.close();
