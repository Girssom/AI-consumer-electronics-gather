export interface Event {
  id: number;
  eventName: string;
  category: string;
  subcategory: string;
  companies: string[];
  products: string[];
  technologies: string[];
  suppliers: string[];
  whatHappened: string;
  whyItMatters: string;
  industryImpact: Record<string, string>;
  importanceScore: number;
  confidence: number;
  articleCount: number;
}

export interface DailyReport {
  generatedAt: string;
  heroInsight: string;
  topEvents: Event[];
  technologyRadar: Array<{ name: string; eventCount: number }>;
  companyWatch: Array<{ company: string; events: string[]; topScore: number }>;
  supplyChainRadar: Event[];
  latestBriefs: Array<{
    id: number;
    title: string;
    summary: string;
    url: string;
    source: string;
    language: string;
    publishedAt: string;
    eventId: number;
    eventName: string;
    category: string;
    importanceScore: number;
  }>;
}

export interface CollectionStatus {
  latestRun: null | {
    id: number;
    startedAt: string;
    finishedAt: string | null;
    status: "running" | "success" | "partial" | "failed";
    fetchedCount: number;
    insertedCount: number;
    sourceCount: number;
    successfulSources: number;
  };
  sources: Array<{ name: string; lastSuccessAt: string | null; lastError: string | null }>;
}
