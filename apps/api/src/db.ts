import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";

let instance: Database.Database | undefined;

export function getDb(databasePath = config.databasePath): Database.Database {
  if (databasePath === ":memory:") return new Database(":memory:");
  if (!instance) {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    instance = new Database(databasePath);
    instance.pragma("journal_mode = WAL");
    instance.pragma("foreign_keys = ON");
  }
  return instance;
}
