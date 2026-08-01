export interface NewsSource {
  name: string;
  feedUrl: string;
  language: string;
}

export const defaultSources: NewsSource[] = [
  { name: "IT之家", feedUrl: "https://www.ithome.com/rss/", language: "zh-CN" },
  { name: "36氪", feedUrl: "https://www.36kr.com/feed", language: "zh-CN" },
  { name: "少数派", feedUrl: "https://sspai.com/feed", language: "zh-CN" },
  { name: "雷峰网", feedUrl: "https://www.leiphone.com/feed", language: "zh-CN" },
  { name: "爱范儿", feedUrl: "https://www.ifanr.com/feed", language: "zh-CN" },
  { name: "The Verge", feedUrl: "https://www.theverge.com/rss/index.xml", language: "en" },
  { name: "Engadget", feedUrl: "https://www.engadget.com/rss.xml", language: "en" },
  { name: "Ars Technica Gadgets", feedUrl: "https://feeds.arstechnica.com/arstechnica/gadgets", language: "en" },
  { name: "9to5Mac", feedUrl: "https://9to5mac.com/feed/", language: "en" },
  { name: "Android Authority", feedUrl: "https://www.androidauthority.com/feed/", language: "en" },
  { name: "TechCrunch Gadgets", feedUrl: "https://techcrunch.com/category/gadgets/feed/", language: "en" }
];
