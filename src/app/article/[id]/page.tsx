import { getArticleById } from "@/lib/db";
import { getSourceById } from "@/lib/sources";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const article = getArticleById(id);

  if (!article) {
    notFound();
  }

  const source = getSourceById(article.source_id);
  const isAnalyzed = !!article.analyzed_at;

  const pubDate = article.pub_date
    ? new Date(article.pub_date).toLocaleDateString("sl-SI", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // Split transformed content into paragraphs
  const contentParagraphs = article.transformed_content
    ? article.transformed_content.split(/\n\n+/).filter((p) => p.trim())
    : [];

  return (
    <div className="min-h-screen">
      {/* Back nav */}
      <nav className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Nazaj na novice
          </Link>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-4 py-12 sm:px-6">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {source && (
            <span className="flex items-center gap-2 text-sm text-white/50">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: source.color }}
              />
              {source.name}
            </span>
          )}
          {pubDate && (
            <span className="text-sm text-white/30">{pubDate}</span>
          )}
          {article.category && (
            <span className="px-3 py-1 text-xs rounded-full bg-purple-400/10 text-purple-300 border border-purple-400/20">
              {article.category}
            </span>
          )}
          {isAnalyzed && (
            <span className="px-3 py-1 text-xs rounded-full bg-green-400/10 text-green-300 border border-green-400/20">
              Preoblikovano
            </span>
          )}
        </div>

        {/* Title */}
        {isAnalyzed && article.transformed_title ? (
          <>
            <h1
              className="text-3xl sm:text-4xl font-bold text-white/90 leading-tight mb-3"
              style={{ fontFamily: "var(--font-playfair), var(--font-serif)" }}
            >
              {article.transformed_title}
            </h1>
            <p className="text-base text-white/25 line-through italic mb-8">
              {article.original_title}
            </p>
          </>
        ) : (
          <h1
            className="text-3xl sm:text-4xl font-bold text-white/70 leading-tight mb-8"
            style={{ fontFamily: "var(--font-playfair), var(--font-serif)" }}
          >
            {article.original_title}
          </h1>
        )}

        {/* Key insight */}
        {isAnalyzed && article.key_insight && (
          <div className="pl-4 border-l-3 border-green-400/50 mb-10">
            <p className="text-lg text-green-300/80 italic leading-relaxed">
              {article.key_insight}
            </p>
          </div>
        )}

        {/* Harmony score */}
        {isAnalyzed && article.harmony_score !== null && (
          <div className="flex items-center gap-4 mb-10 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg width={64} height={64} className="-rotate-90">
                <circle
                  cx={32}
                  cy={32}
                  r={28}
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="4"
                />
                <circle
                  cx={32}
                  cy={32}
                  r={28}
                  fill="none"
                  stroke={
                    article.harmony_score >= 75
                      ? "#4ADE80"
                      : article.harmony_score >= 50
                        ? "#FBBF24"
                        : "#FF6B6B"
                  }
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={
                    2 * Math.PI * 28 -
                    (article.harmony_score / 100) * 2 * Math.PI * 28
                  }
                />
              </svg>
              <span
                className="absolute text-lg font-bold"
                style={{
                  color:
                    article.harmony_score >= 75
                      ? "#4ADE80"
                      : article.harmony_score >= 50
                        ? "#FBBF24"
                        : "#FF6B6B",
                }}
              >
                {article.harmony_score}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/60">
                Indeks harmonije
              </p>
              <p className="text-xs text-white/30">
                Kako blizu je tema harmonični resoluciji
              </p>
            </div>
          </div>
        )}

        {/* === PREOBLIKOVAN CELOTEN ČLANEK === */}
        {isAnalyzed && contentParagraphs.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[1px] bg-gradient-to-r from-green-400/50 to-transparent" />
              <h2 className="text-sm font-semibold text-green-400/70 uppercase tracking-wider">
                Preoblikovan članek
              </h2>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-green-400/20 to-transparent" />
            </div>
            <div className="space-y-5 pl-0 sm:pl-2">
              {contentParagraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-base sm:text-lg text-white/75 leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* === ORIGINAL CONTENT (collapsed) === */}
        {article.original_content && (
          <details className="mb-12 group">
            <summary className="flex items-center gap-3 cursor-pointer mb-4">
              <div className="w-8 h-[1px] bg-gradient-to-r from-white/20 to-transparent" />
              <span className="text-sm text-white/30 uppercase tracking-wider hover:text-white/50 transition-colors">
                Originalni tekst
              </span>
              <svg
                className="w-3 h-3 text-white/20 group-open:rotate-90 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </summary>
            <div className="space-y-4 pl-0 sm:pl-2 opacity-60">
              {article.original_content
                .split(/\n\n+/)
                .filter((p) => p.trim())
                .map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-sm text-white/40 leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
            </div>
          </details>
        )}

        {/* Triad Analysis */}
        {isAnalyzed && (
          <div className="space-y-6 mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-[1px] bg-gradient-to-r from-purple-400/50 to-transparent" />
              <h2 className="text-sm font-semibold text-purple-400/70 uppercase tracking-wider">
                Triada analiza
              </h2>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-purple-400/20 to-transparent" />
            </div>

            {/* SVG Diagram */}
            <div className="flex justify-center py-4">
              <svg viewBox="0 0 200 180" className="w-48 h-auto">
                <defs>
                  <filter id="glow2">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <line x1="100" y1="20" x2="180" y2="160" stroke="#FF6B6B" strokeWidth="1.5" opacity="0.3" />
                <line x1="100" y1="20" x2="20" y2="160" stroke="#4ADE80" strokeWidth="1.5" opacity="0.3" />
                <line x1="20" y1="160" x2="180" y2="160" stroke="#818CF8" strokeWidth="1.5" opacity="0.3" />
                <polygon points="100,20 180,160 20,160" fill="rgba(192,132,252,0.05)" />
                <circle cx="100" cy="20" r="8" fill="#FF6B6B" filter="url(#glow2)" />
                <circle cx="180" cy="160" r="8" fill="#818CF8" filter="url(#glow2)" />
                <circle cx="20" cy="160" r="8" fill="#4ADE80" filter="url(#glow2)" />
                <text x="100" y="8" textAnchor="middle" fill="#FF6B6B" fontSize="10" fontWeight="bold">TEZA</text>
                <text x="192" y="168" textAnchor="start" fill="#818CF8" fontSize="10" fontWeight="bold">ANTITEZA</text>
                <text x="8" y="168" textAnchor="end" fill="#4ADE80" fontSize="10" fontWeight="bold">SINTEZA</text>
              </svg>
            </div>

            {/* Three columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-red-400/20 bg-red-400/[0.03] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-sm font-semibold text-red-400">
                    {article.thesis_label}
                  </span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  {article.thesis_text}
                </p>
              </div>
              <div className="rounded-xl border border-indigo-400/20 bg-indigo-400/[0.03] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full bg-indigo-400" />
                  <span className="text-sm font-semibold text-indigo-400">
                    {article.antithesis_label}
                  </span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  {article.antithesis_text}
                </p>
              </div>
              <div className="rounded-xl border border-green-400/20 bg-green-400/[0.03] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-sm font-semibold text-green-400">
                    {article.synthesis_label}
                  </span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  {article.synthesis_text}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Link to original */}
        <div className="pt-6 border-t border-white/5">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Preberi originalni članek na {source?.name || "viru"}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </article>
    </div>
  );
}
