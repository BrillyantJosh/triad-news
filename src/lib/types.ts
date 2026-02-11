export interface NewsSource {
  id: string;
  name: string;
  rssUrl: string;
  color: string;
  language: "en" | "sl";
  bias?: string;
}

export interface FeedItem {
  title: string;
  link: string;
  summary: string;
  source: string;
  pubDate: string;
}

export interface TriadAnalysis {
  transformed_title: string;
  category: string;
  thesis: {
    label: string;
    text: string;
  };
  antithesis: {
    label: string;
    text: string;
  };
  synthesis: {
    label: string;
    text: string;
  };
  key_insight: string;
  harmony_score: number;
}

export interface Article {
  id: string;
  source_id: string;
  original_title: string;
  original_summary: string | null;
  url: string;
  pub_date: string | null;
  fetched_at: string;
  analyzed_at: string | null;
  transformed_title: string | null;
  category: string | null;
  thesis_label: string | null;
  thesis_text: string | null;
  antithesis_label: string | null;
  antithesis_text: string | null;
  synthesis_label: string | null;
  synthesis_text: string | null;
  key_insight: string | null;
  harmony_score: number | null;
  language: string;
}
