import type Database from "better-sqlite3";
import { ClassificationAgent } from "./agents/classifier.js";
import { EntityExtractionAgent } from "./agents/entityExtractor.js";
import { EventClusterAgent } from "./agents/clusterer.js";
import { IndustryAnalystAgent } from "./agents/analyst.js";
import { ImportanceScorer } from "./agents/scorer.js";
import type { ArticleInput, EnrichedArticle, EventDraft } from "./types.js";

const extractor = new EntityExtractionAgent();
const classifier = new ClassificationAgent();
const clusterer = new EventClusterAgent();
const analyst = new IndustryAnalystAgent();
const scorer = new ImportanceScorer();

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function eventName(articles: EnrichedArticle[]): string {
  const company = articles.flatMap((item) => item.entities.companies)[0] ?? "消费电子行业";
  const technologies = articles.flatMap((item) => item.entities.technologies);
  const technology = articles[0]!.classification.category === "手机" &&
    technologies.some((item) => ["AI Phone", "On-device AI", "NPU"].includes(item))
    ? "AI Phone"
    : technologies[0] ?? articles[0]!.classification.subcategory;
  const suffix = technology === "Foldable Display" ? "折叠屏供应链升级" : `${technology}战略推进`;
  return `${company} ${suffix}`;
}

export function analyzeArticles(articles: EnrichedArticle[]): EventDraft[] {
  return clusterer.cluster(articles).map(({ articles: grouped }) => {
    const analysis = analyst.analyze(grouped);
    const score = scorer.score(grouped);
    const classificationConfidence = grouped.reduce((sum, item) => sum + item.classification.confidence, 0) / grouped.length;
    const confidence = Math.min(analysis.confidence, classificationConfidence);
    return {
      eventName: eventName(grouped),
      category: grouped[0]!.classification.category,
      subcategory: grouped[0]!.classification.subcategory,
      companies: unique(grouped.flatMap((item) => item.entities.companies)),
      products: unique(grouped.flatMap((item) => item.entities.products)),
      technologies: unique(grouped.flatMap((item) => item.entities.technologies)),
      suppliers: unique(grouped.flatMap((item) => item.entities.suppliers)),
      articleIds: grouped.map((item) => item.id),
      analysis,
      importanceScore: score.total,
      scoreBreakdown: score.breakdown,
      confidence,
      status: confidence >= 0.6 ? "published" : "draft"
    };
  });
}

export function processArticles(db: Database.Database, inputs?: ArticleInput[]): EventDraft[] {
  if (inputs) {
    const insert = db.prepare(`INSERT INTO articles(title, summary, url, source, published_at)
      VALUES (@title, @summary, @url, @source, @publishedAt)
      ON CONFLICT(url) DO UPDATE SET title=excluded.title, summary=excluded.summary, published_at=excluded.published_at`);
    db.transaction(() => inputs.forEach((item) => insert.run(item)))();
  }
  const rows = db.prepare(`SELECT id, title, summary, url, source, published_at AS publishedAt
    FROM articles WHERE datetime(published_at) >= datetime('now','-3 days') ORDER BY published_at DESC LIMIT 300`).all() as EnrichedArticle[];
  const enriched = rows.map((article) => {
    const entities = extractor.extract(article);
    const classification = classifier.classify(article, entities);
    db.prepare(`UPDATE articles SET entities_json=?, category=?, subcategory=?, classification_confidence=?, processed_at=CURRENT_TIMESTAMP WHERE id=?`)
      .run(JSON.stringify(entities), classification.category, classification.subcategory, classification.confidence, article.id);
    return { ...article, entities, classification };
  });
  const events = analyzeArticles(enriched);
  db.transaction(() => {
    db.exec("DELETE FROM event_articles; DELETE FROM industry_events;");
    const insertEvent = db.prepare(`INSERT INTO industry_events (
      event_name,event_key,category,subcategory,companies_json,products_json,technologies_json,suppliers_json,
      what_happened,why_it_matters,impact_analysis_json,importance_score,score_breakdown_json,confidence,analysis_status,event_date
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const link = db.prepare("INSERT INTO event_articles(event_id, article_id, relevance_score) VALUES (?,?,?)");
    for (const event of events) {
      const key = `${event.eventName}:${event.articleIds.sort((a,b)=>a-b).join("-")}`.toLowerCase();
      const result = insertEvent.run(event.eventName, key, event.category, event.subcategory,
        JSON.stringify(event.companies), JSON.stringify(event.products), JSON.stringify(event.technologies), JSON.stringify(event.suppliers),
        event.analysis.whatHappened, event.analysis.whyItMatters, JSON.stringify(event.analysis.industryImpact),
        event.importanceScore, JSON.stringify(event.scoreBreakdown), event.confidence, event.status, new Date().toISOString().slice(0, 10));
      event.articleIds.forEach((articleId) => link.run(result.lastInsertRowid, articleId, 1));
    }
  })();
  return events;
}
