"use client";

import { useState, useEffect, useCallback } from "react";
import { Article } from "@/lib/types";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import SourceFilter from "@/components/SourceFilter";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import LoadingPulse from "@/components/LoadingPulse";
import Footer from "@/components/Footer";

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAnalyzedOnly, setShowAnalyzedOnly] = useState(false);

  const fetchArticles = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (sourceFilter) params.set("source", sourceFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (searchQuery) params.set("search", searchQuery);
      if (showAnalyzedOnly) params.set("analyzed", "true");
      params.set("limit", "50");

      const res = await fetch(`/api/feeds?${params}`);
      const data = await res.json();
      setArticles(data.articles || []);
      setTotal(data.total || 0);
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Fetch articles error:", err);
    } finally {
      setLoading(false);
    }
  }, [sourceFilter, categoryFilter, searchQuery, showAnalyzedOnly]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        handleRefresh();
      },
      15 * 60 * 1000
    );
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch("/api/refresh", { method: "POST" });
      await fetchArticles();
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAnalyze = async (articleId: string) => {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_id: articleId }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Napaka pri analizi");
    }

    // Refresh articles to get updated data
    await fetchArticles();
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const analyzedCount = articles.filter((a) => a.analyzed_at).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        totalArticles={total}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} />
            </div>
            <button
              onClick={() => setShowAnalyzedOnly(!showAnalyzedOnly)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border transition-all ${
                showAnalyzedOnly
                  ? "bg-green-400/10 border-green-400/30 text-green-300"
                  : "bg-white/[0.03] border-white/10 text-white/40 hover:text-white/60"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
              >
                <polygon
                  points="12,2 22,20 2,20"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              Samo analizirani ({analyzedCount})
            </button>
          </div>

          <SourceFilter selected={sourceFilter} onChange={setSourceFilter} />
          <CategoryFilter
            categories={categories}
            selected={categoryFilter}
            onChange={setCategoryFilter}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingPulse text="Nalagam članke..." />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-4">
              <svg
                viewBox="0 0 80 80"
                className="w-16 h-16 mx-auto opacity-20"
              >
                <polygon
                  points="40,8 72,68 8,68"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h2 className="text-xl text-white/40 mb-2">Ni člankov</h2>
            <p className="text-sm text-white/25 mb-6">
              Kliknite &quot;Osveži&quot; za pridobivanje novic iz RSS virov.
            </p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-2.5 bg-purple-400/10 border border-purple-400/30 text-purple-300 rounded-lg hover:bg-purple-400/20 transition-all disabled:opacity-40"
            >
              {refreshing ? "Osvežujem..." : "Osveži feede"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onAnalyze={handleAnalyze}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
