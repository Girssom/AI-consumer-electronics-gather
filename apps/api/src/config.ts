import "dotenv/config";
import path from "node:path";

export const config = {
  port: Number(process.env.API_PORT ?? 3101),
  databasePath: path.resolve(process.cwd(), process.env.DATABASE_PATH ?? "../../data/intelligence.db"),
  newsFetchCron: process.env.NEWS_FETCH_CRON ?? "0 8 * * *",
  newsFetchTimezone: process.env.NEWS_FETCH_TIMEZONE ?? "Asia/Shanghai",
  autoFetchOnStart: process.env.AUTO_FETCH_ON_START !== "false"
};
