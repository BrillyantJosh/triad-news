import { NextRequest, NextResponse } from "next/server";
import { getArticles, getCategories } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const source = searchParams.get("source") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const analyzedParam = searchParams.get("analyzed");
    let analyzed: boolean | undefined;
    if (analyzedParam === "true") analyzed = true;
    else if (analyzedParam === "false") analyzed = false;

    const { articles, total } = getArticles({
      source,
      category,
      analyzed,
      search,
      limit,
      offset,
    });

    const categories = getCategories();

    return NextResponse.json({ articles, total, categories });
  } catch (err) {
    console.error("GET /api/feeds error:", err);
    return NextResponse.json(
      { error: "Napaka pri pridobivanju člankov" },
      { status: 500 }
    );
  }
}
