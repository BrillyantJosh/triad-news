import { NewsSource } from "./types";

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "fox-news",
    name: "Fox News",
    rssUrl: "https://moxie.foxnews.com/google-publisher/latest.xml",
    color: "#003366",
    language: "en",
    bias: "right-leaning",
  },
  {
    id: "cnn",
    name: "CNN",
    rssUrl: "http://rss.cnn.com/rss/edition.rss",
    color: "#CC0000",
    language: "en",
    bias: "left-leaning",
  },
  {
    id: "24ur",
    name: "24ur.com",
    rssUrl: "https://www.24ur.com/rss",
    color: "#FF6600",
    language: "sl",
  },
  {
    id: "necenzurirano",
    name: "Necenzurirano.si",
    rssUrl: "https://necenzurirano.si/rss/site.xml",
    color: "#1A1A2E",
    language: "sl",
  },
  {
    id: "siol",
    name: "Siol.net",
    rssUrl: "",
    color: "#0066CC",
    language: "sl",
  },
];

export function getSourceById(id: string): NewsSource | undefined {
  return NEWS_SOURCES.find((s) => s.id === id);
}
