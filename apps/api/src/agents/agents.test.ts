import assert from "node:assert/strict";
import test from "node:test";
import { ClassificationAgent } from "./classifier.js";
import { EntityExtractionAgent } from "./entityExtractor.js";
import { EventClusterAgent } from "./clusterer.js";
import type { ArticleInput, EnrichedArticle } from "../types.js";

const extractor = new EntityExtractionAgent();
const classifier = new ClassificationAgent();
const cases: Array<[string, string, string]> = [
  ["ThinkPad X13 Detachable搭载Core Ultra处理器", "联想AI PC强化NPU能力", "AI PC"],
  ["DeepSeek建设AI数据中心", "部署AI服务器和算力基础设施", "AI基础设施"],
  ["Google Pixel Watch发布", "智能手表增加健康AI功能", "智能穿戴"]
];

for (const [title, summary, expected] of cases) {
  test(`主体优先分类: ${expected}`, () => {
    const article: ArticleInput = { title, summary, url: title, source: "test", publishedAt: new Date().toISOString() };
    const entities = extractor.extract(article);
    assert.equal(classifier.classify(article, entities).category, expected);
  });
}

test("Apple AI相关文章合并为单一事件", () => {
  const inputs = [
    { title: "Apple iPhone强化端侧AI", summary: "Apple Intelligence与NPU升级" },
    { title: "Apple Siri AI升级", summary: "iPhone端侧AI体验更新" },
    { title: "Apple iOS加入AI功能", summary: "Apple Intelligence登陆iPhone" }
  ];
  const enriched = inputs.map((input, index) => {
    const base = { ...input, id: index + 1, url: String(index), source: "test", publishedAt: new Date().toISOString() };
    const entities = extractor.extract(base);
    return { ...base, entities, classification: classifier.classify(base, entities) };
  }) as EnrichedArticle[];
  assert.equal(new EventClusterAgent().cluster(enriched).length, 1);
});

test("social 不应被子串 soc 误判为半导体", () => {
  const article: ArticleInput = {
    title: "Australia's social media ban for under-16s has had limited impact so far",
    summary: "There was no statistically significant change in AI chatbot use.",
    url: "social-media-ban",
    source: "test",
    publishedAt: new Date().toISOString()
  };
  const entities = extractor.extract(article);
  const result = classifier.classify(article, entities);
  assert.notEqual(result.category, "半导体");
  assert.equal(result.confidence, 0.45);
});
