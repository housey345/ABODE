import { NextResponse } from "next/server";

const LARAVEL_BASE = process.env.LARAVEL_API_BASE_URL;
const API_TOKEN = process.env.ABODE_API_TOKEN;

export async function GET() {
  const checks: Record<string, { ok: boolean; detail: string }> = {};

  // Check env vars are present (don't reveal values)
  checks.env_laravel_base = {
    ok: Boolean(LARAVEL_BASE),
    detail: LARAVEL_BASE ? "set" : "missing",
  };
  checks.env_api_token = {
    ok: Boolean(API_TOKEN),
    detail: API_TOKEN ? "set" : "missing",
  };

  // Ping the Laravel backend
  if (LARAVEL_BASE && API_TOKEN) {
    try {
      const res = await fetch(`${LARAVEL_BASE}/api/health`, {
        method: "GET",
        headers: { Authorization: `Bearer ${API_TOKEN}` },
        signal: AbortSignal.timeout(5000),
      });
      const body = await res.text().catch(() => "");
      checks.laravel_ping = {
        ok: res.ok,
        detail: `HTTP ${res.status}${body ? ` — ${body.slice(0, 120)}` : ""}`,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      checks.laravel_ping = { ok: false, detail: message };
    }
  } else {
    checks.laravel_ping = { ok: false, detail: "skipped — env vars missing" };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  return NextResponse.json({ ok: allOk, checks }, { status: allOk ? 200 : 503 });
}
