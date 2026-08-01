import type { Category } from "../types.js";

export const companyAliases: Record<string, string[]> = {
  Apple: ["apple", "苹果", "库克"],
  Samsung: ["samsung", "三星"],
  Google: ["google", "谷歌", "pixel"],
  Lenovo: ["lenovo", "联想", "thinkpad"],
  Qualcomm: ["qualcomm", "高通", "snapdragon", "骁龙"],
  Huawei: ["huawei", "华为", "鸿蒙"],
  Xiaomi: ["xiaomi", "小米"],
  DeepSeek: ["deepseek"],
  Meta: ["meta", "quest"],
  BOE: ["boe", "京东方"],
  TSMC: ["tsmc", "台积电"]
};

export const productAliases: Record<string, string[]> = {
  iPhone: ["iphone"],
  "Apple Intelligence": ["apple intelligence"],
  Siri: ["siri"],
  iOS: ["ios"],
  "Pixel Watch": ["pixel watch"],
  ThinkPad: ["thinkpad"],
  "Galaxy Z": ["galaxy z", "fold"],
  Snapdragon: ["snapdragon", "骁龙"],
  "Meta Quest": ["meta quest", "quest"]
};

export const technologyAliases: Record<string, string[]> = {
  "AI Phone": ["ai phone", "手机ai", "iphone ai", "智能手机ai"],
  "On-device AI": ["on-device ai", "端侧ai", "本地ai", "npu"],
  "Foldable Display": ["foldable", "折叠屏", "柔性oled"],
  "Silicon Carbon Battery": ["silicon carbon", "硅碳", "硅负极"],
  "XR Spatial Computing": ["spatial computing", "空间计算", "xr", "vr", "ar"],
  "AI Agent Device": ["ai agent", "智能体设备"],
  "AI Data Center": ["data center", "数据中心", "算力中心", "ai服务器"],
  "OLED": ["oled"],
  "SoC": ["soc", "snapdragon", "骁龙"],
  "NPU": ["npu"]
};

export interface SubjectRule {
  category: Category;
  subcategory: string;
  phrases: string[];
}

export const subjectRules: SubjectRule[] = [
  { category: "智能穿戴", subcategory: "Smart Watch", phrases: ["watch", "手表", "wearable", "穿戴"] },
  { category: "AI PC", subcategory: "AI PC", phrases: ["thinkpad", "laptop", "notebook", "pc", "笔记本", "电脑"] },
  { category: "AI基础设施", subcategory: "AI Data Center", phrases: ["data center", "数据中心", "算力中心", "ai服务器", "大模型基础设施"] },
  { category: "XR", subcategory: "XR Spatial Computing", phrases: ["quest", "vision pro", "spatial computing", "xr", "vr headset"] },
  { category: "平板", subcategory: "Tablet", phrases: ["ipad", "tablet", "平板"] },
  { category: "供应链", subcategory: "Display", phrases: ["面板供应", "display supplier", "oled supplier", "京东方供货"] },
  { category: "手机", subcategory: "Foldable", phrases: ["foldable phone", "折叠手机", "galaxy z"] },
  { category: "手机", subcategory: "AI Phone", phrases: ["iphone", "smartphone", "手机", "ai phone", "pixel phone"] },
  { category: "AIoT", subcategory: "Smart Home", phrases: ["smart home", "智能家居", "iot device"] },
  { category: "半导体", subcategory: "SoC", phrases: ["semiconductor", "晶圆", "制程", "芯片发布", "soc发布"] }
];
