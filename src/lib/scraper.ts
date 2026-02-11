import * as cheerio from "cheerio";

/**
 * Scrape the full article text content from a URL.
 * Tries multiple strategies to extract the main content.
 */
export async function scrapeArticleContent(
  url: string
): Promise<{ content: string; wordCount: number }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TriadNews/1.0; +https://lanasee.us)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $(
      "script, style, nav, footer, header, aside, .ad, .advertisement, .sidebar, .comments, .related, .social-share, .cookie-banner, noscript, iframe"
    ).remove();

    // Strategy 1: Look for article/main content containers
    const selectors = [
      "article .article-body",
      "article .article-content",
      "article .content-body",
      "article .story-body",
      ".article-body",
      ".article-content",
      ".article__body",
      ".story-body",
      ".post-content",
      ".entry-content",
      ".content-body",
      '[itemprop="articleBody"]',
      '[data-component="text-block"]',
      "article",
      "main article",
      "main",
      ".content",
    ];

    let content = "";

    for (const selector of selectors) {
      const el = $(selector);
      if (el.length > 0) {
        // Get all paragraph text
        const paragraphs: string[] = [];
        el.find("p").each((_i, p) => {
          const text = $(p).text().trim();
          if (text.length > 30) {
            paragraphs.push(text);
          }
        });

        if (paragraphs.length >= 2) {
          content = paragraphs.join("\n\n");
          break;
        }
      }
    }

    // Fallback: get all paragraphs from body
    if (!content) {
      const paragraphs: string[] = [];
      $("body p").each((_i, p) => {
        const text = $(p).text().trim();
        if (text.length > 40) {
          paragraphs.push(text);
        }
      });
      content = paragraphs.join("\n\n");
    }

    // Limit to ~5000 chars to keep within API limits
    if (content.length > 5000) {
      content = content.slice(0, 5000) + "...";
    }

    const wordCount = content.split(/\s+/).filter(Boolean).length;

    return { content, wordCount };
  } catch (err) {
    console.error(`Scrape error for ${url}:`, err);
    return { content: "", wordCount: 0 };
  }
}
