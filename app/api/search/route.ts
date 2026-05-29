import { NextRequest, NextResponse } from "next/server";
import { parseIntent, generateExplanations, type LaravelSearchResult } from "@/lib/openai";
import { searchProperties } from "@/lib/properties";
import type { Property } from "@/lib/properties";
import { checkRateLimit } from "@/lib/rate-limit";

const LARAVEL_BASE = process.env.LARAVEL_API_BASE_URL;
const API_TOKEN = process.env.ABODE_API_TOKEN;

function metersToMins(m: number): number {
  return Math.max(1, Math.round(m / 80));
}

function buildPoiDistances(distances: LaravelSearchResult["distances"]): Partial<Property> {
  return {
    nearest_school: distances.school != null
      ? { name: "Nearby school", km: Math.round(distances.school / 100) / 10, mins: metersToMins(distances.school) }
      : undefined,
    nearest_station: distances.station != null
      ? { name: "Nearby station", km: Math.round(distances.station / 100) / 10, mins: metersToMins(distances.station) }
      : undefined,
    nearest_park: distances.park != null
      ? { name: "Nearby park", km: Math.round(distances.park / 100) / 10, mins: metersToMins(distances.park) }
      : undefined,
  };
}

export async function POST(req: NextRequest) {
  // Each search can trigger up to two paid OpenAI calls — throttle abuse.
  const limited = checkRateLimit(req, { key: "search", limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const intent = await parseIntent(query.trim());

    // Phase 1 fallback: no Laravel configured, use in-memory dataset
    if (!LARAVEL_BASE || !API_TOKEN) {
      const results = searchProperties(intent);
      return NextResponse.json({ intent, results: results.slice(0, 8), total: results.length });
    }

    // Phase 2: forward parsed filters to Laravel
    const laravelRes = await fetch(`${LARAVEL_BASE}/api/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({ filters: intent, limit: 12 }),
    });

    if (!laravelRes.ok) {
      console.error("Laravel search error:", laravelRes.status, await laravelRes.text());
      // Fall back to Phase 1 dataset on Laravel error
      const results = searchProperties(intent);
      return NextResponse.json({ intent, results: results.slice(0, 8), total: results.length });
    }

    const { results: laravelResults }: { results: LaravelSearchResult[] } = await laravelRes.json();

    const explanations = await generateExplanations(laravelResults, intent);

    const results = laravelResults.map((r, i) => ({
      property: { ...r.property, ...buildPoiDistances(r.distances) } as Property,
      score: 100,
      explanation: explanations[i] ?? "",
    }));

    return NextResponse.json({ intent, results, total: results.length });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
