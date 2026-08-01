import { useEffect, useMemo, useState } from "react";
import {
  BarChart3, Bell, Bookmark, ChevronRight, Clock3, Cpu, ExternalLink, Flame,
  Hash, Home, Layers3, Menu, MessageCircle, RefreshCw, Search, Share2, Sparkles, TrendingUp
} from "lucide-react";
import type { CollectionStatus, DailyReport } from "./types";

const categories = ["全部", "手机", "智能穿戴", "AI PC", "AI基础设施", "半导体", "供应链", "XR"];
const impactLabels: Record<string, string> = { chip: "芯片", display: "显示", camera: "影像", battery: "电池", odm: "ODM", market: "市场", infrastructure: "基础设施" };

export function App() {
  const [report, setReport] = useState<DailyReport>();
  const [collection, setCollection] = useState<CollectionStatus>();
  const [activeCategory, setActiveCategory] = useState("全部");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = () => Promise.all([
    fetch("/api/reports/daily").then((res) => res.ok ? res.json() : Promise.reject(new Error("日报加载失败"))).then(setReport),
    fetch("/api/collection/status").then((res) => res.json()).then(setCollection)
  ]);

  useEffect(() => { loadDashboard().catch((err: Error) => setError(err.message)); }, []);

  const refreshNews = async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/collection/run", { method: "POST" });
      if (!response.ok) throw new Error((await response.json()).message);
      await loadDashboard();
    } catch (err) { setError(err instanceof Error ? err.message : "更新失败"); }
    finally { setRefreshing(false); }
  };

  const feed = useMemo(() => {
    if (!report) return [];
    const keyword = query.trim().toLowerCase();
    return report.latestBriefs.filter((item) =>
      (activeCategory === "全部" || item.category === activeCategory) &&
      (!keyword || `${item.title} ${item.summary} ${item.eventName}`.toLowerCase().includes(keyword))
    );
  }, [report, activeCategory, query]);

  if (error && !report) return <main className="state"><h1>暂时无法载入产业情报</h1><p>{error}</p></main>;
  if (!report) return <main className="state"><div className="loader" /><p>正在连接产业信号</p></main>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="logo" href="#"><span><Sparkles size={17} /></span>Signal</a>
          <label className="search-box"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索公司、产品、技术或事件" /></label>
          <nav className="top-actions"><button><Home size={18} /><span>首页</span></button><button><Bell size={18} /><span>动态</span></button><button className="refresh-top" onClick={refreshNews} disabled={refreshing}><RefreshCw size={17} className={refreshing ? "spinning" : ""} /><span>{refreshing ? "更新中" : "更新"}</span></button></nav>
        </div>
      </header>

      <div className="page-grid">
        <aside className="left-rail">
          <div className="left-sticky">
            <div className="side-title"><Flame size={19} />产业频道</div>
            {categories.map((category) => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}><span>{category === "全部" ? <Home size={17} /> : <span className="nav-dot" />}</span>{category}</button>)}
            <div className="side-divider" />
            <button><BarChart3 size={17} />今日热榜</button><button><Bookmark size={17} />我的关注</button><button><Layers3 size={17} />供应链雷达</button>
          </div>
        </aside>

        <main className="feed-column">
          <div className="feed-tabs">
            <button className="active">热门</button><button>最新</button><button>高影响</button><button>供应链</button><button>技术趋势</button><Menu size={20} />
          </div>

          <section className="lead-card">
            <div><span className="lead-kicker"><Flame size={14} />今日焦点</span><h1>{report.topEvents[0]?.eventName}</h1><p>{report.heroInsight}</p></div>
            <div className="lead-score"><strong>{report.topEvents[0]?.importanceScore}</strong><span>重要性</span></div>
          </section>

          <div className="feed-heading"><span>{activeCategory === "全部" ? "全行业情报流" : `${activeCategory}情报流`}</span><small>{feed.length} 条信号</small></div>

          <section className="feed-list">
            {feed.map((brief) => {
              const event = report.topEvents.find((item) => item.id === brief.eventId);
              return (
                <article className="post-card" key={brief.id}>
                  <div className="post-avatar">{brief.source.slice(0, 1).toUpperCase()}<i /></div>
                  <div className="post-body">
                    <div className="post-author"><div><strong>{brief.source}</strong><span className="verified">V</span><span className="language-tag">{brief.language?.startsWith("zh") ? "中文" : "EN"}</span><p><Clock3 size={11} />{new Date(brief.publishedAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })} · 来自产业新闻源</p></div><a className="source-button" href={brief.url}>查看原文</a></div>
                    <a className="post-link" href={brief.url}><h2>{brief.title}</h2><p>{brief.summary || `该报道聚焦${brief.category}领域的最新产品、技术及产业变化。`}</p></a>
                    <div className="event-box"><span><Hash size={13} /> 聚合事件</span><b>{brief.eventName}</b><ChevronRight size={15} /></div>
                    {event && <div className="impact-chips">{Object.entries(event.industryImpact).slice(0, 3).map(([key, value]) => <span key={key}><i>{impactLabels[key] ?? key}</i>{value}</span>)}</div>}
                    <div className="post-footer"><button><Share2 size={16} />分享</button><button><MessageCircle size={16} />关联 {event?.articleCount ?? 1}</button><button><TrendingUp size={16} />重要性 {brief.importanceScore}</button><a href={brief.url}><ExternalLink size={16} />原文</a></div>
                  </div>
                </article>
              );
            })}
            {!feed.length && <div className="empty-feed"><Search size={30} /><h3>没有匹配的产业情报</h3><p>尝试切换分类或使用其他关键词。</p></div>}
          </section>
        </main>

        <aside className="right-rail">
          <div className="right-sticky">
            <section className="side-card hot-card"><div className="card-title"><Flame size={18} />今日产业热榜<a href="#">完整榜单</a></div>{report.topEvents.slice(0, 8).map((event, index) => <div className="rank-row" key={event.id}><b className={index < 3 ? "hot" : ""}>{index + 1}</b><div><strong>{event.eventName}</strong><span>{event.articleCount} 篇报道 · {event.category}</span></div><em>{event.importanceScore}</em></div>)}</section>
            <section className="side-card"><div className="card-title"><Cpu size={18} />技术趋势</div><div className="trend-tags">{report.technologyRadar.map((item) => <span key={item.name}>{item.name}<b>{item.eventCount}</b></span>)}</div></section>
            <section className="side-card status-card"><div className="card-title"><RefreshCw size={17} />采集状态</div><div className="source-status"><i className={collection?.latestRun?.status ?? "idle"} /><div><strong>{collection?.latestRun?.successfulSources ?? 0}/{collection?.latestRun?.sourceCount ?? 0} 来源在线</strong><span>{collection?.latestRun?.finishedAt ? `更新于 ${new Date(collection.latestRun.finishedAt).toLocaleString("zh-CN")}` : "等待首次采集"}</span></div></div></section>
            <p className="copyright">Signal Intelligence V2<br />事件驱动 · 产业分析 · 实时更新</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
