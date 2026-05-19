import { NextRequest, NextResponse } from "next/server";
import { parseIntent } from "@/lib/openai";
import { searchProperties } from "@/lib/properties";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const intent = await parseIntent(query.trim());
    const results = searchProperties(intent);

    return NextResponse.json({
      intent,
      results: results.slice(0, 8),
      total: results.length,
    });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
