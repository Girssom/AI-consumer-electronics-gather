import type { EnrichedArticle, ScoreBreakdown } from "../types.js";

export class ImportanceScorer {
  score(articles: EnrichedArticle[]): { total: number; breakdown: ScoreBreakdown } {
    const companies = new Set(articles.flatMap((article) => article.entities.companies));
    const technologies = new Set(articles.flatMap((article) => article.entities.technologies));
    const suppliers = new Set(articles.flatMap((article) => article.entities.suppliers));
    const major = [...companies].some((company) => ["Apple", "Samsung", "Google", "Huawei", "Qualcomm"].includes(company));
    const breakdown: ScoreBreakdown = {
      strategic: Math.min(100, 58 + articles.length * 8 + (technologies.has("AI Phone") ? 18 : 0)),
      company: Math.min(100, 48 + companies.size * 14 + (major ? 18 : 0)),
      supplyChain: Math.min(100, 38 + suppliers.size * 18 + (technologies.has("SoC") || technologies.has("OLED") ? 20 : 0)),
      innovation: Math.min(100, 45 + technologies.size * 13),
      market: Math.min(100, 42 + articles.length * 7)
    };
    const total = Math.round(
      breakdown.strategic * 0.3 +
      breakdown.company * 0.25 +
      breakdown.supplyChain * 0.2 +
      breakdown.innovation * 0.15 +
      breakdown.market * 0.1
    );
    return { total, breakdown };
  }
}
