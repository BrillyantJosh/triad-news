import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";
import { Article, FeedItem, TriadAnalysis } from "./types";

const DB_PATH = process.env.DATABASE_PATH || "./data/triad.db";

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.resolve(DB_PATH);
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.pragma("busy_timeout = 5000");
    initSchema();
  }
  return db;
}

function initSchema() {
  const d = getDb();
  d.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      original_title TEXT NOT NULL,
      original_summary TEXT,
      url TEXT NOT NULL UNIQUE,
      pub_date TEXT,
      fetched_at TEXT DEFAULT (datetime('now')),
      analyzed_at TEXT,
      transformed_title TEXT,
      category TEXT,
      thesis_label TEXT,
      thesis_text TEXT,
      antithesis_label TEXT,
      antithesis_text TEXT,
      synthesis_label TEXT,
      synthesis_text TEXT,
      key_insight TEXT,
      harmony_score INTEGER,
      original_content TEXT,
      transformed_content TEXT,
      language TEXT DEFAULT 'sl'
    );

    CREATE INDEX IF NOT EXISTS idx_source ON articles(source_id);
    CREATE INDEX IF NOT EXISTS idx_date ON articles(pub_date DESC);
    CREATE INDEX IF NOT EXISTS idx_analyzed ON articles(analyzed_at);
  `);

  // Migration: add columns if they don't exist (for existing DBs)
  try {
    d.exec(`ALTER TABLE articles ADD COLUMN original_content TEXT`);
  } catch (_) { /* column already exists */ }
  try {
    d.exec(`ALTER TABLE articles ADD COLUMN transformed_content TEXT`);
  } catch (_) { /* column already exists */ }
}

export function hashUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 32);
}

export function insertArticle(item: FeedItem): boolean {
  const d = getDb();
  const id = hashUrl(item.link);
  const stmt = d.prepare(`
    INSERT OR IGNORE INTO articles (id, source_id, original_title, original_summary, url, pub_date, language)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const sourceLanguage =
    item.source === "fox-news" || item.source === "cnn" ? "en" : "sl";
  const result = stmt.run(
    id,
    item.source,
    item.title,
    item.summary || null,
    item.link,
    item.pubDate || null,
    sourceLanguage
  );
  return result.changes > 0;
}

export function insertArticles(items: FeedItem[]): number {
  const d = getDb();
  const insert = d.prepare(`
    INSERT OR IGNORE INTO articles (id, source_id, original_title, original_summary, url, pub_date, language)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const tx = d.transaction((articles: FeedItem[]) => {
    let count = 0;
    for (const item of articles) {
      const id = hashUrl(item.link);
      const lang =
        item.source === "fox-news" || item.source === "cnn" ? "en" : "sl";
      const result = insert.run(
        id,
        item.source,
        item.title,
        item.summary || null,
        item.link,
        item.pubDate || null,
        lang
      );
      if (result.changes > 0) count++;
    }
    return count;
  });
  return tx(items);
}

export function saveOriginalContent(articleId: string, content: string): void {
  const d = getDb();
  d.prepare(`UPDATE articles SET original_content = ? WHERE id = ?`).run(
    content,
    articleId
  );
}

export function saveAnalysis(articleId: string, analysis: TriadAnalysis): void {
  const d = getDb();
  const stmt = d.prepare(`
    UPDATE articles SET
      analyzed_at = datetime('now'),
      transformed_title = ?,
      transformed_content = ?,
      category = ?,
      thesis_label = ?,
      thesis_text = ?,
      antithesis_label = ?,
      antithesis_text = ?,
      synthesis_label = ?,
      synthesis_text = ?,
      key_insight = ?,
      harmony_score = ?
    WHERE id = ?
  `);
  stmt.run(
    analysis.transformed_title,
    analysis.transformed_content || null,
    analysis.category,
    analysis.thesis.label,
    analysis.thesis.text,
    analysis.antithesis.label,
    analysis.antithesis.text,
    analysis.synthesis.label,
    analysis.synthesis.text,
    analysis.key_insight,
    analysis.harmony_score,
    articleId
  );
}

export function getArticleById(id: string): Article | undefined {
  const d = getDb();
  return d.prepare("SELECT * FROM articles WHERE id = ?").get(id) as
    | Article
    | undefined;
}

interface GetArticlesParams {
  source?: string;
  category?: string;
  analyzed?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export function getArticles(params: GetArticlesParams): {
  articles: Article[];
  total: number;
} {
  const d = getDb();
  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (params.source) {
    conditions.push("source_id = ?");
    values.push(params.source);
  }
  if (params.category) {
    conditions.push("category = ?");
    values.push(params.category);
  }
  if (params.analyzed === true) {
    conditions.push("analyzed_at IS NOT NULL");
  } else if (params.analyzed === false) {
    conditions.push("analyzed_at IS NULL");
  }
  if (params.search) {
    conditions.push(
      "(original_title LIKE ? OR transformed_title LIKE ? OR key_insight LIKE ?)"
    );
    const term = `%${params.search}%`;
    values.push(term, term, term);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRow = d
    .prepare(`SELECT COUNT(*) as count FROM articles ${where}`)
    .get(...values) as { count: number };

  const limit = params.limit || 50;
  const offset = params.offset || 0;
  const articles = d
    .prepare(
      `SELECT * FROM articles ${where} ORDER BY pub_date DESC, fetched_at DESC LIMIT ? OFFSET ?`
    )
    .all(...values, limit, offset) as Article[];

  return { articles, total: countRow.count };
}

export function getUnanalyzedCount(): number {
  const d = getDb();
  const row = d
    .prepare("SELECT COUNT(*) as count FROM articles WHERE analyzed_at IS NULL")
    .get() as { count: number };
  return row.count;
}

export function getRecentAnalysisCount(hours: number = 1): number {
  const d = getDb();
  const row = d
    .prepare(
      `SELECT COUNT(*) as count FROM articles WHERE analyzed_at > datetime('now', ? || ' hours')`
    )
    .get(`-${hours}`) as { count: number };
  return row.count;
}

export function getCategories(): string[] {
  const d = getDb();
  const rows = d
    .prepare(
      "SELECT DISTINCT category FROM articles WHERE category IS NOT NULL ORDER BY category"
    )
    .all() as { category: string }[];
  return rows.map((r) => r.category);
}

export function getTotalCount(): number {
  const d = getDb();
  const row = d
    .prepare("SELECT COUNT(*) as count FROM articles")
    .get() as { count: number };
  return row.count;
}
