import { NextRequest, NextResponse } from "next/server";
import { getArticleById, saveAnalysis, getRecentAnalysisCount } from "@/lib/db";
import { analyzeArticle } from "@/lib/claude";
import { getSourceById } from "@/lib/sources";

export const dynamic = "force-dynamic";

const MAX_ANALYSES_PER_HOUR = parseInt(
  process.env.MAX_ANALYSES_PER_HOUR || "20",
  10
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { article_id } = body;

    if (!article_id) {
      return NextResponse.json(
        { error: "article_id je obvezen" },
        { status: 400 }
      );
    }

    const article = getArticleById(article_id);
    if (!article) {
      return NextResponse.json(
        { error: "Članek ne obstaja" },
        { status: 404 }
      );
    }

    if (article.analyzed_at) {
      return NextResponse.json({
        analysis: {
          transformed_title: article.transformed_title,
          category: article.category,
          thesis: { label: article.thesis_label, text: article.thesis_text },
          antithesis: {
            label: article.antithesis_label,
            text: article.antithesis_text,
          },
          synthesis: {
            label: article.synthesis_label,
            text: article.synthesis_text,
          },
          key_insight: article.key_insight,
          harmony_score: article.harmony_score,
        },
        cached: true,
      });
    }

    // Rate limiting
    const recentCount = getRecentAnalysisCount(1);
    if (recentCount >= MAX_ANALYSES_PER_HOUR) {
      return NextResponse.json(
        {
          error: `Dosežena omejitev ${MAX_ANALYSES_PER_HOUR} analiz na uro. Poskusite ponovno pozneje.`,
          rate_limited: true,
        },
        { status: 429 }
      );
    }

    const source = getSourceById(article.source_id);
    const analysis = await analyzeArticle(
      article.original_title,
      article.original_summary || "",
      article.source_id,
      source?.bias
    );

    saveAnalysis(article.id, analysis);

    return NextResponse.json({ analysis, cached: false });
  } catch (err) {
    console.error("POST /api/analyze error:", err);
    const message =
      err instanceof Error ? err.message : "Napaka pri analizi članka";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
