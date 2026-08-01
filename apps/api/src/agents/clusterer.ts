import type { EnrichedArticle } from "../types.js";

export interface ArticleCluster {
  key: string;
  articles: EnrichedArticle[];
}

function overlap(a: string[], b: string[]): boolean {
  return a.some((item) => b.includes(item));
}

export class EventClusterAgent {
  cluster(articles: EnrichedArticle[]): ArticleCluster[] {
    const clusters: ArticleCluster[] = [];
    for (const article of articles) {
      const existing = clusters.find((cluster) => {
        const anchor = cluster.articles[0]!;
        return anchor.classification.category === article.classification.category &&
          (overlap(anchor.entities.companies, article.entities.companies) ||
           overlap(anchor.entities.products, article.entities.products)) &&
          (overlap(anchor.entities.technologies, article.entities.technologies) ||
           anchor.classification.subcategory === article.classification.subcategory);
      });
      if (existing) existing.articles.push(article);
      else {
        const company = article.entities.companies[0] ?? "industry";
        const theme = article.entities.technologies[0] ?? article.classification.subcategory;
        clusters.push({ key: `${company}:${article.classification.category}:${theme}`.toLowerCase(), articles: [article] });
      }
    }
    return clusters;
  }
}
