import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { getDb } from "./db.js";
import { migrate } from "./migrate.js";
import { getDailyReport } from "./report.js";
import { getCollectionStatus } from "./collector/newsCollector.js";
import { runCollection, startScheduler } from "./scheduler.js";

const app = express();
const db = getDb();
migrate(db);

app.use(cors({ origin: ["http://localhost:5174", "http://127.0.0.1:5174"] }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "consumer-electronics-intelligence-api" }));
app.get("/api/reports/daily", (_req, res) => res.json(getDailyReport(db)));
app.get("/api/collection/status", (_req, res) => res.json(getCollectionStatus(db)));
app.post("/api/collection/run", async (_req, res) => {
  try {
    res.json(await runCollection(db));
  } catch (error) {
    res.status(409).json({ message: error instanceof Error ? error.message : "采集任务启动失败" });
  }
});
app.get("/api/events/:id/articles", (req, res) => {
  const articles = db.prepare(`SELECT a.id,a.title,a.summary,a.url,a.source,a.published_at AS publishedAt
    FROM articles a JOIN event_articles ea ON ea.article_id=a.id WHERE ea.event_id=? ORDER BY a.published_at DESC`).all(req.params.id);
  res.json(articles);
});

startScheduler(db);
app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
  if (config.autoFetchOnStart) void runCollection(db).catch((error) => console.error("Initial collection failed:", error));
});
