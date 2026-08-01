import type { Analysis, EnrichedArticle } from "../types.js";

function list(values: string[], fallback: string): string {
  return values.length ? values.join("、") : fallback;
}

export class IndustryAnalystAgent {
  analyze(articles: EnrichedArticle[]): Analysis {
    const first = articles[0]!;
    const companies = [...new Set(articles.flatMap((article) => article.entities.companies))];
    const technologies = [...new Set(articles.flatMap((article) => article.entities.technologies))];
    const category = first.classification.category;
    const impact: Analysis["industryImpact"] = { market: `${category}竞争将更依赖产品定义与生态协同` };

    if (technologies.some((item) => ["AI Phone", "On-device AI", "SoC", "NPU"].includes(item))) {
      impact.chip = "端侧算力、内存带宽与高端 SoC 需求提升";
      impact.odm = "软硬件协同和整机调优复杂度上升";
    }
    if (technologies.includes("Foldable Display") || technologies.includes("OLED")) {
      impact.display = "高规格 OLED 与折叠模组需求增加";
    }
    if (technologies.includes("Silicon Carbon Battery")) impact.battery = "高能量密度电芯导入节奏加快";
    if (category === "AI基础设施") impact.infrastructure = "服务器、网络与电力基础设施投入扩大";

    return {
      whatHappened: `${list(companies, "行业厂商")}围绕${list(technologies, first.classification.subcategory)}推进新产品或战略布局，${articles.length}篇报道形成同一事件脉络。`,
      whyItMatters: `该事件可能改变${category}的产品竞争重点，并向核心器件、供应链协同与市场预期传导。`,
      industryImpact: impact,
      confidence: Math.min(0.95, 0.68 + articles.length * 0.04)
    };
  }
}
