import type Database from "better-sqlite3";
import Parser from "rss-parser";
import { processArticles } from "../pipeline.js";
import type { ArticleInput } from "../types.js";
import { defaultSources } from "./sources.js";

const parser = new Parser({
  timeout: 15_000,
  headers: { "User-Agent": "Signal-Industry-Intelligence/2.0 (+local RSS reader)" }
});

const relevantTerms = [
  "手机", "iphone", "smartphone", "pixel", "galaxy", "华为", "小米", "oppo", "vivo",
  "wearable", "watch", "穿戴", "ai pc", "laptop", "thinkpad", "芯片", "soc", "npu",
  "semiconductor", "display", "oled", "battery", "电池", "供应链", "odm", "ems",
  "xr", "spatial", "aiot", "智能家居", "消费电子", "端侧ai", "on-device"
];
const marketOnlyTerms = ["净利润", "净卖出", "净买入", "港元", "股价", "涨停", "跌停", "收盘", "主力资金", "融资余额", "股票"];
const chineseDeviceTerms = ["手机", "iphone", "ipad", "mac", "苹果", "华为", "荣耀", "三星", "oppo", "vivo", "pixel", "手表", "穿戴", "耳机", "电脑", "笔记本", "ai pc", "芯片", "半导体", "soc", "npu", "oled", "显示屏", "折叠屏", "头显", "xr", "智能眼镜", "平板", "智能家居", "高通", "英伟达"];
const offTopicChineseTerms = ["汽车", "新车", "suv", "宝马", "ipo", "申购", "港股", "美股", "融资"];

function cleanText(value?: string): string {
  return (value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function isRelevant(article: ArticleInput): boolean {
  const text = `${article.title} ${article.summary}`.toLowerCase();
  if (marketOnlyTerms.some((term) => article.title.includes(term))) return false;
  if (article.language?.startsWith("zh")) {
    const title = article.title.toLowerCase();
    if (/\d+(?:\.\d+)?\s*万(?:元|,|，)/.test(title)) return false;
    if (offTopicChineseTerms.some((term) => title.includes(term))) return false;
    if (!chineseDeviceTerms.some((term) => title.includes(term))) return false;
  }
  return relevantTerms.some((term) => text.includes(term));
}

function upsertSources(db: Database.Database): void {
  const statement = db.prepare(`INSERT INTO news_sources(name, feed_url, language)
    VALUES (@name, @feedUrl, @language)
    ON CONFLICT(name) DO UPDATE SET feed_url=excluded.feed_url, language=excluded.language, enabled=1`);
  db.transaction(() => {
    db.prepare("UPDATE news_sources SET enabled=0").run();
    defaultSources.forEach((source) => statement.run(source));
  })();
}

export interface CollectionResult {
  runId: number;
  status: "success" | "partial" | "failed";
  fetchedCount: number;
  insertedCount: number;
  successfulSources: number;
  sourceCount: number;
}

export async function collectLatestNews(db: Database.Database): Promise<CollectionResult> {
  upsertSources(db);
  const sources = db.prepare("SELECT id,name,feed_url AS feedUrl,language FROM news_sources WHERE enabled=1").all() as Array<{ id: number; name: string; feedUrl: string; language: string }>;
  const run = db.prepare("INSERT INTO collection_runs(source_count) VALUES (?)").run(sources.length);
  const runId = Number(run.lastInsertRowid);
  let fetchedCount = 0;
  let insertedCount = 0;
  let successfulSources = 0;
  const errors: string[] = [];
  const insertArticle = db.prepare(`INSERT OR IGNORE INTO articles(title,summary,url,source,published_at,language)
    VALUES (@title,@summary,@url,@source,@publishedAt,@language)`);

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.feedUrl);
      const articles = feed.items.slice(0, 30).map((item) => ({
        title: cleanText(item.title),
        summary: cleanText(item.contentSnippet ?? item.content ?? item.summary).slice(0, 1200),
        url: item.link ?? item.guid ?? "",
        source: source.name,
        publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        language: source.language
      })).filter((item) => item.title && item.url && isRelevant(item));
      fetchedCount += articles.length;
      for (const article of articles) insertedCount += insertArticle.run(article).changes;
      successfulSources += 1;
      db.prepare("UPDATE news_sources SET last_success_at=CURRENT_TIMESTAMP,last_error=NULL WHERE id=?").run(source.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${source.name}: ${message}`);
      db.prepare("UPDATE news_sources SET last_error=? WHERE id=?").run(message.slice(0, 500), source.id);
    }
  }

  const status = successfulSources === sources.length ? "success" : successfulSources ? "partial" : "failed";
  db.prepare(`UPDATE collection_runs SET finished_at=CURRENT_TIMESTAMP,status=?,fetched_count=?,inserted_count=?,
    successful_source_count=?,error_summary=? WHERE id=?`)
    .run(status, fetchedCount, insertedCount, successfulSources, errors.join("\n").slice(0, 3000) || null, runId);
  if (successfulSources > 0) processArticles(db);
  return { runId, status, fetchedCount, insertedCount, successfulSources, sourceCount: sources.length };
}

export function getCollectionStatus(db: Database.Database) {
  const latestRun = db.prepare(`SELECT id,started_at AS startedAt,finished_at AS finishedAt,status,
    fetched_count AS fetchedCount,inserted_count AS insertedCount,source_count AS sourceCount,
    successful_source_count AS successfulSources FROM collection_runs ORDER BY id DESC LIMIT 1`).get() ?? null;
  const sources = db.prepare(`SELECT name,last_success_at AS lastSuccessAt,last_error AS lastError
    FROM news_sources WHERE enabled=1 ORDER BY name`).all();
  return { latestRun, sources };
}
