import { getDb } from "../db.js";
import { migrate } from "../migrate.js";
import { processArticles } from "../pipeline.js";
import { sampleArticles } from "../sampleData.js";

const db = getDb();
migrate(db);
const events = processArticles(db, sampleArticles);
console.log(`Pipeline complete: ${sampleArticles.length} articles -> ${events.length} events.`);
for (const event of events) console.log(`${event.importanceScore} | ${event.status} | ${event.eventName} | ${event.articleIds.length} articles`);
