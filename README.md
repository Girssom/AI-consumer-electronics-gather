# 消费电子产业 AI 情报系统 V2

本地独立运行的产业事件分析平台。系统将新闻依次经过实体抽取、主体优先分类、事件聚合、产业分析和重要性评分，日报只读取已发布事件。

## 启动

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run pipeline
npm run dev
```

- Dashboard: http://localhost:5174
- API: http://localhost:3101

默认端口避开 3001 和 5173。

## 核心命令

- `npm run db:migrate`：执行数据库迁移
- `npm run pipeline`：载入演示新闻并重建事件日报
- `npm run collect`：立即采集最新行业新闻并重建事件日报
- `npm test`：运行分类、聚合和发布门禁测试
- `npm run build`：构建前后端

系统默认每天北京时间 08:00 自动采集；可通过 `.env` 中的 `NEWS_FETCH_CRON` 和 `NEWS_FETCH_TIMEZONE` 调整。

## 分析状态

事件状态按 `draft → verified → published` 流转。Dashboard 与日报接口只返回 `published` 事件，内部分析说明不会出现在用户界面。
