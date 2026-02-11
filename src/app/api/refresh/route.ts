import { NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss";
import { insertArticles, getTotalCount } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { items, errors } = await fetchAllFeeds();
    const newCount = insertArticles(items);
    const total = getTotalCount();

    return NextResponse.json({
      new_articles: newCount,
      fetched: items.length,
      total,
      errors,
    });
  } catch (err) {
    console.error("POST /api/refresh error:", err);
    return NextResponse.json(
      { error: "Napaka pri osvežitvi feedov" },
      { status: 500 }
    );
  }
}
