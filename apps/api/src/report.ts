import type Database from "better-sqlite3";

const parse = <T>(value: string): T => JSON.parse(value) as T;

function normalizeTitle(value: string): string {
  return value.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "").slice(0, 120);
}

function buildBilingualFeed(rows: Record<string, any>[], limit = 24) {
  const marketOnlyTerms = ["净利润", "净卖出", "净买入", "港元", "股价", "涨停", "跌停", "收盘", "主力资金", "融资余额", "股票"];
  const chineseDeviceTerms = ["手机", "iphone", "ipad", "mac", "苹果", "华为", "荣耀", "三星", "oppo", "vivo", "pixel", "手表", "穿戴", "耳机", "电脑", "笔记本", "ai pc", "芯片", "半导体", "soc", "npu", "oled", "显示屏", "折叠屏", "头显", "xr", "智能眼镜", "平板", "智能家居", "高通", "英伟达"];
  const offTopicChineseTerms = ["汽车", "新车", "suv", "宝马", "ipo", "申购", "港股", "美股", "融资"];
  const seenTitles = new Set<string>();
  const unique = rows.filter((row) => {
    if (marketOnlyTerms.some((term) => String(row.title).includes(term))) return false;
    if (String(row.language).startsWith("zh")) {
      const title = String(row.title).toLowerCase();
      if (/\d+(?:\.\d+)?\s*万(?:元|,|，)/.test(title)) return false;
      if (offTopicChineseTerms.some((term) => title.includes(term))) return false;
      if (!chineseDeviceTerms.some((term) => title.includes(term))) return false;
    }
    const key = normalizeTitle(row.title);
    if (!key || seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });
  const chinese = unique.filter((row) => String(row.language).startsWith("zh"));
  const chineseEvents = new Set(chinese.map((row) => row.eventId).filter(Boolean));
  const english = unique.filter((row) => !String(row.language).startsWith("zh") && !chineseEvents.has(row.eventId));
  const mixed: Record<string, any>[] = [];
  let zhIndex = 0;
  let enIndex = 0;
  while (mixed.length < limit && (zhIndex < chinese.length || enIndex < english.length)) {
    if (zhIndex < chinese.length) mixed.push(chinese[zhIndex++]!);
    if (mixed.length < limit && enIndex < english.length) mixed.push(english[enIndex++]!);
  }
  return mixed;
}

export function getDailyReport(db: Database.Database) {
  const rows = db.prepare(`
    SELECT e.*, COUNT(ea.article_id) article_count
    FROM industry_events e
    JOIN event_articles ea ON ea.event_id = e.id
    WHERE e.analysis_status = 'published'
    GROUP BY e.id
    ORDER BY e.importance_score DESC, e.event_date DESC
  `).all() as Record<string, any>[];

  const events = rows.map((row) => ({
    id: row.id,
    eventName: row.event_name,
    category: row.category,
    subcategory: row.subcategory,
    companies: parse<string[]>(row.companies_json),
    products: parse<string[]>(row.products_json),
    technologies: parse<string[]>(row.technologies_json),
    suppliers: parse<string[]>(row.suppliers_json),
    whatHappened: row.what_happened,
    whyItMatters: row.why_it_matters,
    industryImpact: parse<Record<string, string>>(row.impact_analysis_json),
    importanceScore: row.importance_score,
    scoreBreakdown: parse<Record<string, number>>(row.score_breakdown_json),
    confidence: row.confidence,
    articleCount: row.article_count,
    status: row.analysis_status
  }));

  const technologyRadar = [...new Set(events.flatMap((event) => event.technologies))]
    .filter((item) => ["AI Phone", "On-device AI", "Foldable Display", "Silicon Carbon Battery", "XR Spatial Computing", "AI Agent Device"].includes(item))
    .map((name) => ({ name, eventCount: events.filter((event) => event.technologies.includes(name)).length }));
  const companyMap = new Map<string, { company: string; events: string[]; topScore: number }>();
  for (const event of events) for (const company of event.companies) {
    const current = companyMap.get(company) ?? { company, events: [], topScore: 0 };
    current.events.push(event.eventName);
    current.topScore = Math.max(current.topScore, event.importanceScore);
    companyMap.set(company, current);
  }

  const latestBriefRows = db.prepare(`
    SELECT a.id,a.title,a.summary,a.url,a.source,a.language,a.published_at AS publishedAt,
      e.id AS eventId,COALESCE(e.event_name,'待聚合产业信号') AS eventName,
      COALESCE(e.category,a.category,'消费电子') AS category,
      COALESCE(e.importance_score,0) AS importanceScore
    FROM articles a
    LEFT JOIN event_articles ea ON ea.article_id=a.id
    LEFT JOIN industry_events e ON e.id=ea.event_id
    WHERE (a.url LIKE 'https://%' OR a.url LIKE 'http://%')
      AND datetime(a.published_at) >= datetime('now','-3 days')
    GROUP BY a.id
    ORDER BY datetime(a.published_at) DESC,e.importance_score DESC
    LIMIT 120
  `).all() as Record<string, any>[];
  const latestBriefs = buildBilingualFeed(latestBriefRows);

  return {
    generatedAt: new Date().toISOString(),
    heroInsight: events[0] ? `${events[0].eventName}成为今日最重要产业信号，影响正从终端体验向核心器件与协同开发传导。` : "今日暂无已发布产业事件。",
    topEvents: events,
    technologyRadar,
    companyWatch: [...companyMap.values()].sort((a, b) => b.topScore - a.topScore),
    supplyChainRadar: events.filter((event) => event.suppliers.length || Object.keys(event.industryImpact).some((key) => ["chip", "display", "battery", "odm"].includes(key))),
    latestBriefs
  };
}
