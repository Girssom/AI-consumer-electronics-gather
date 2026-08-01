import type { ArticleInput, Entities } from "../types.js";
import { companyAliases, productAliases, technologyAliases } from "./taxonomy.js";
import { matchesPhrase } from "./textMatch.js";

function matchDictionary(text: string, dictionary: Record<string, string[]>): string[] {
  const normalized = text.toLowerCase();
  return Object.entries(dictionary)
    .filter(([, aliases]) => aliases.some((alias) => matchesPhrase(normalized, alias)))
    .map(([canonical]) => canonical);
}

export class EntityExtractionAgent {
  extract(article: ArticleInput): Entities {
    const text = `${article.title} ${article.summary}`;
    const companies = matchDictionary(text, companyAliases);
    const products = matchDictionary(text, productAliases);
    const technologies = matchDictionary(text, technologyAliases);
    const suppliers = companies.filter((company) => ["BOE", "TSMC", "Qualcomm"].includes(company));
    return { companies, products, technologies, suppliers };
  }
}
