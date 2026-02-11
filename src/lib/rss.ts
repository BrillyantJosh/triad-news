import RSSParser from "rss-parser";
import * as cheerio from "cheerio";
import { FeedItem, NewsSource } from "./types";
import { NEWS_SOURCES } from "./sources";

const parser = new RSSParser({
  timeout: 15000,
  headers: {
    "User-Agent": "TriadNews/1.0",
  },
});

async function fetchRSSFeed(source: NewsSource): Promise<FeedItem[]> {
  if (!source.rssUrl) return [];

  try {
    const feed = await parser.parseURL(source.rssUrl);
    return (feed.items || []).slice(0, 30).map((item) => ({
      title: (item.title || "").trim(),
      link: item.link || "",
      summary: (item.contentSnippet || item.content || "").slice(0, 500).trim(),
      source: source.id,
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
    }));
  } catch (err) {
    console.error(`RSS fetch error for ${source.name}:`, err);
    return [];
  }
}

async function scrapeSiol(): Promise<FeedItem[]> {
  try {
    const res = await fetch("https://siol.net", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TriadNews/1.0; +https://triad.news)",
      },
      signal: AbortSignal.timeout(15000),
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const articles: FeedItem[] = [];
    const seen = new Set<string>();

    $("article a, .card a, .article_teaser a, [class*='article'] a").each(
      (_i, el) => {
        const $el = $(el);
        const href = $el.attr("href");
        if (!href || seen.has(href)) return;

        // Find text from the link or its children
        const title = (
          $el.find("h1, h2, h3, h4, .title").text() || $el.text()
        ).trim();
        if (!title || title.length < 10) return;

        const link = href.startsWith("http")
          ? href
          : `https://siol.net${href}`;
        seen.add(href);

        const summary =
          $el.closest("article, .card, [class*='article']").find("p").first().text().trim() || "";

        articles.push({
          title,
          link,
          summary,
          source: "siol",
          pubDate: new Date().toISOString(),
        });
      }
    );

    return articles.slice(0, 30);
  } catch (err) {
    console.error("Siol.net scrape error:", err);
    return [];
  }
}

export async function fetchAllFeeds(): Promise<{
  items: FeedItem[];
  errors: string[];
}> {
  const errors: string[] = [];
  const results: FeedItem[] = [];

  const promises = NEWS_SOURCES.map(async (source) => {
    if (source.id === "siol") {
      const items = await scrapeSiol();
      if (items.length === 0) {
        errors.push(`Siol.net: ni bilo mogoče pridobiti člankov`);
      }
      return items;
    }
    const items = await fetchRSSFeed(source);
    if (items.length === 0) {
      errors.push(`${source.name}: RSS feed ni dosegljiv`);
    }
    return items;
  });

  const allResults = await Promise.allSettled(promises);
  for (const result of allResults) {
    if (result.status === "fulfilled") {
      results.push(...result.value);
    }
  }

  return { items: results, errors };
}
