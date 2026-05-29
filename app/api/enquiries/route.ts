import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, sameOriginOnly } from "@/lib/rate-limit";

const LARAVEL_BASE = process.env.LARAVEL_API_BASE_URL;
const API_TOKEN = process.env.ABODE_API_TOKEN;

export async function POST(req: NextRequest) {
  const origin = sameOriginOnly(req);
  if (origin) return origin;
  const limited = checkRateLimit(req, { key: "enquiries", limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  if (!LARAVEL_BASE || !API_TOKEN) {
    return NextResponse.json({ error: "Enquiries not available" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const laravelRes = await fetch(`${LARAVEL_BASE}/api/enquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  const data = await laravelRes.json();
  return NextResponse.json(data, { status: laravelRes.status });
}
