import { getDb } from "../db.js";
import { migrate } from "../migrate.js";

migrate(getDb());
console.log("Database migrations complete.");
