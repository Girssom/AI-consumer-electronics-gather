export const categories = [
  "手机", "平板", "智能穿戴", "AIoT", "XR", "AI PC", "半导体", "供应链", "AI基础设施"
] as const;

export type Category = typeof categories[number];
export type AnalysisStatus = "draft" | "verified" | "published";

export interface ArticleInput {
  id?: number;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  language?: string;
}

export interface Entities {
  companies: string[];
  products: string[];
  technologies: string[];
  suppliers: string[];
}

export interface Classification {
  category: Category;
  subcategory: string;
  confidence: number;
  rationale: string;
}

export interface EnrichedArticle extends ArticleInput {
  id: number;
  entities: Entities;
  classification: Classification;
}

export interface IndustryImpact {
  chip?: string;
  display?: string;
  camera?: string;
  battery?: string;
  odm?: string;
  market?: string;
  infrastructure?: string;
}

export interface Analysis {
  whatHappened: string;
  whyItMatters: string;
  industryImpact: IndustryImpact;
  confidence: number;
}

export interface ScoreBreakdown {
  strategic: number;
  company: number;
  supplyChain: number;
  innovation: number;
  market: number;
}

export interface EventDraft {
  eventName: string;
  category: Category;
  subcategory: string;
  companies: string[];
  products: string[];
  technologies: string[];
  suppliers: string[];
  articleIds: number[];
  analysis: Analysis;
  importanceScore: number;
  scoreBreakdown: ScoreBreakdown;
  confidence: number;
  status: AnalysisStatus;
}
