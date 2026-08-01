import { getDb } from "../db.js";
import { migrate } from "../migrate.js";
import { collectLatestNews } from "../collector/newsCollector.js";

const db = getDb();
migrate(db);
const result = await collectLatestNews(db);
console.log(JSON.stringify(result, null, 2));
