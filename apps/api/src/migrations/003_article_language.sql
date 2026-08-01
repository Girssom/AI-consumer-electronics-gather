ALTER TABLE articles ADD COLUMN language TEXT NOT NULL DEFAULT 'unknown';
CREATE INDEX IF NOT EXISTS idx_articles_language_date ON articles(language, published_at DESC);
