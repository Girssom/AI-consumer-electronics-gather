import cron from "node-cron";
import type Database from "better-sqlite3";
import { config } from "./config.js";
import { collectLatestNews } from "./collector/newsCollector.js";

let running = false;

export async function runCollection(db: Database.Database) {
  if (running) throw new Error("新闻采集任务正在运行");
  running = true;
  try {
    return await collectLatestNews(db);
  } finally {
    running = false;
  }
}

export function startScheduler(db: Database.Database): void {
  cron.schedule(config.newsFetchCron, () => {
    void runCollection(db).catch((error) => console.error("Scheduled collection failed:", error));
  }, { timezone: config.newsFetchTimezone });
  console.log(`News scheduler ready: ${config.newsFetchCron} (${config.newsFetchTimezone})`);
}
