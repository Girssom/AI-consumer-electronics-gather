import type { ArticleInput, Classification, Entities } from "../types.js";
import { subjectRules } from "./taxonomy.js";

const keywordRules = [
  { category: "半导体" as const, subcategory: "SoC", phrases: ["cpu", "芯片", "soc", "core ultra"] },
  { category: "手机" as const, subcategory: "OS", phrases: ["ios", "android", "手机"] },
  { category: "供应链" as const, subcategory: "ODM", phrases: ["odm", "ems", "代工"] }
];

export class ClassificationAgent {
  classify(article: ArticleInput, entities: Entities): Classification {
    const title = article.title.toLowerCase();
    const body = `${article.title} ${article.summary}`.toLowerCase();
    const candidates = subjectRules.map((rule) => {
      const subjectHits = rule.phrases.filter((phrase) => title.includes(phrase)).length;
      const productHits = rule.phrases.filter((phrase) => body.includes(phrase)).length;
      const entityBoost =
        (rule.category === "智能穿戴" && entities.products.includes("Pixel Watch")) ||
        (rule.category === "AI PC" && entities.products.includes("ThinkPad")) ||
        (rule.category === "AI基础设施" && entities.technologies.includes("AI Data Center")) ? 1 : 0;
      return { rule, score: Math.min(50, subjectHits * 25 + entityBoost * 30) + Math.min(30, productHits * 10) };
    });
    for (const rule of keywordRules) {
      const hits = rule.phrases.filter((phrase) => body.includes(phrase)).length;
      const existing = candidates.find((item) => item.rule.category === rule.category);
      if (existing) existing.score += Math.min(20, hits * 5);
      else candidates.push({ rule, score: Math.min(20, hits * 5) });
    }
    candidates.sort((a, b) => b.score - a.score);
    const winner = candidates[0];
    if (!winner || winner.score === 0) {
      return { category: "AIoT", subcategory: "Other Device", confidence: 0.45, rationale: "未发现强主体信号，进入人工复核队列" };
    }
    return {
      category: winner.rule.category,
      subcategory: winner.rule.subcategory,
      confidence: Math.min(0.98, 0.5 + winner.score / 200),
      rationale: `主体与产品信号优先，综合得分 ${winner.score.toFixed(0)}`
    };
  }
}
