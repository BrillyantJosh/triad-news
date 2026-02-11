"use client";

import { useState } from "react";
import { Article } from "@/lib/types";
import { getSourceById } from "@/lib/sources";
import HarmonyGauge from "./HarmonyGauge";
import TriadAnalysis from "./TriadAnalysis";
import LoadingPulse from "./LoadingPulse";

interface ArticleCardProps {
  article: Article;
  onAnalyze: (id: string) => Promise<void>;
}

export default function ArticleCard({ article, onAnalyze }: ArticleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const source = getSourceById(article.source_id);
  const isAnalyzed = !!article.analyzed_at;

  const handleAnalyze = async () => {
    setError(null);
    setAnalyzing(true);
    try {
      await onAnalyze(article.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Napaka pri analizi");
    } finally {
      setAnalyzing(false);
    }
  };

  const pubDate = article.pub_date
    ? new Date(article.pub_date).toLocaleDateString("sl-SI", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <article className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Source badge + date */}
          <div className="flex items-center gap-3 mb-3">
            {source && (
              <span className="flex items-center gap-1.5 text-xs text-white/50">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: source.color }}
                />
                {source.name}
              </span>
            )}
            {pubDate && (
              <span className="text-xs text-white/30">{pubDate}</span>
            )}
            {article.category && (
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-400/10 text-purple-300 border border-purple-400/20">
                {article.category}
              </span>
            )}
          </div>

          {/* Titles */}
          {isAnalyzed && article.transformed_title ? (
            <>
              <h3 className="font-serif text-lg sm:text-xl text-white/90 leading-snug mb-1">
                {article.transformed_title}
              </h3>
              <p className="text-sm text-white/30 line-through italic">
                {article.original_title}
              </p>
            </>
          ) : (
            <h3 className="font-serif text-lg sm:text-xl text-white/70 leading-snug">
              {article.original_title}
            </h3>
          )}

          {/* Key insight */}
          {isAnalyzed && article.key_insight && (
            <div className="mt-3 pl-3 border-l-2 border-green-400/40">
              <p className="text-sm text-green-300/80 italic">
                {article.key_insight}
              </p>
            </div>
          )}
        </div>

        {/* Harmony gauge */}
        {isAnalyzed && article.harmony_score !== null && (
          <div className="flex-shrink-0">
            <HarmonyGauge score={article.harmony_score} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Odpri original
        </a>

        {isAnalyzed ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-purple-400/70 hover:text-purple-300 transition-colors"
          >
            {expanded ? "Skrij triado" : "Prikaži triado"}
          </button>
        ) : (
          <>
            {analyzing ? (
              <LoadingPulse />
            ) : (
              <button
                onClick={handleAnalyze}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-purple-400/10 border border-purple-400/20 text-purple-300 hover:bg-purple-400/20 transition-all"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Analiziraj
              </button>
            )}
          </>
        )}

        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>

      {/* Expanded triad analysis */}
      {expanded && isAnalyzed && (
        <TriadAnalysis
          thesis={{
            label: article.thesis_label!,
            text: article.thesis_text!,
          }}
          antithesis={{
            label: article.antithesis_label!,
            text: article.antithesis_text!,
          }}
          synthesis={{
            label: article.synthesis_label!,
            text: article.synthesis_text!,
          }}
          harmonyScore={article.harmony_score!}
        />
      )}
    </article>
  );
}
