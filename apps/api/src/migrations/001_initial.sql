CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  published_at TEXT NOT NULL,
  entities_json TEXT,
  category TEXT,
  subcategory TEXT,
  classification_confidence REAL,
  processed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS industry_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  event_key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  companies_json TEXT NOT NULL DEFAULT '[]',
  products_json TEXT NOT NULL DEFAULT '[]',
  technologies_json TEXT NOT NULL DEFAULT '[]',
  suppliers_json TEXT NOT NULL DEFAULT '[]',
  what_happened TEXT NOT NULL,
  why_it_matters TEXT NOT NULL,
  impact_analysis_json TEXT NOT NULL DEFAULT '{}',
  importance_score INTEGER NOT NULL DEFAULT 0 CHECK (importance_score BETWEEN 0 AND 100),
  score_breakdown_json TEXT NOT NULL DEFAULT '{}',
  confidence REAL NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 1),
  analysis_status TEXT NOT NULL DEFAULT 'draft' CHECK (analysis_status IN ('draft', 'verified', 'published')),
  event_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_articles (
  event_id INTEGER NOT NULL REFERENCES industry_events(id) ON DELETE CASCADE,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  relevance_score REAL NOT NULL DEFAULT 1,
  PRIMARY KEY (event_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_status_date ON industry_events(analysis_status, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_importance ON industry_events(importance_score DESC);
