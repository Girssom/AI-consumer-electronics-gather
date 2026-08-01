import type { ArticleInput } from "./types.js";

const date = new Date().toISOString();

export const sampleArticles: ArticleInput[] = [
  { title: "Apple加速iPhone端侧AI能力布局", summary: "Apple Intelligence将与新一代iPhone SoC及NPU深度协同。", url: "demo://apple-ai-1", source: "Demo Wire", publishedAt: date },
  { title: "库克谈Apple Intelligence长期战略", summary: "Siri升级将成为iPhone AI体验的关键入口。", url: "demo://apple-ai-2", source: "Demo Wire", publishedAt: date },
  { title: "iOS新版本强化生成式AI功能", summary: "多项On-device AI能力预计随iPhone系统升级落地。", url: "demo://apple-ai-3", source: "Demo Wire", publishedAt: date },
  { title: "iPhone下一代芯片聚焦AI算力", summary: "Apple规划提升NPU与内存带宽以支持Apple Intelligence。", url: "demo://apple-ai-4", source: "Demo Wire", publishedAt: date },
  { title: "Samsung Galaxy Z升级折叠屏方案", summary: "三星推动柔性OLED、铰链与轻薄化设计协同升级。", url: "demo://samsung-fold-1", source: "Demo Wire", publishedAt: date },
  { title: "三星扩大折叠手机OLED供应链合作", summary: "Galaxy Z新机将带动Foldable Display模组需求。", url: "demo://samsung-fold-2", source: "Demo Wire", publishedAt: date },
  { title: "ThinkPad X13 Detachable搭载Core Ultra", summary: "联想推出面向商用场景的AI PC，强化本地NPU能力。", url: "demo://thinkpad-ai-pc", source: "Demo Wire", publishedAt: date },
  { title: "DeepSeek建设新一代AI数据中心", summary: "项目覆盖AI服务器、网络与算力基础设施。", url: "demo://deepseek-dc", source: "Demo Wire", publishedAt: date },
  { title: "Google Pixel Watch增加端侧AI健康功能", summary: "新一代智能手表强化传感器与本地AI处理。", url: "demo://pixel-watch", source: "Demo Wire", publishedAt: date }
];
