import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight in-memory fixed-window rate limiter.
 *
 * This guards the paid / proxying API routes (OpenAI calls, Realtime token
 * minting, Laravel proxy) against trivial abuse. It is per-process and resets
 * on redeploy/cold start — adequate for a single-region demo. For a
 * multi-instance production deployment, replace the store with a shared
 * counter (Upstash Redis / Vercel KV) or front it with Vercel Firewall
 * rate-limiting rules.
 */

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();

// Periodically evict stale windows so the map doesn't grow unbounded.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, win] of buckets) {
    if (win.resetAt <= now) buckets.delete(key);
  }
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export interface RateLimitOptions {
  /** Max requests allowed per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Bucket namespace so different routes count independently. */
  key: string;
}

/**
 * Returns a 429 NextResponse if the caller has exceeded the limit, otherwise
 * null (caller may proceed).
 */
export function checkRateLimit(req: NextRequest, opts: RateLimitOptions): NextResponse | null {
  const now = Date.now();
  sweep(now);

  const id = `${opts.key}:${clientIp(req)}`;
  const win = buckets.get(id);

  if (!win || win.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  win.count += 1;
  if (win.count > opts.limit) {
    const retryAfter = Math.ceil((win.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  return null;
}

/**
 * Rejects cross-origin POSTs. Browsers always send `origin` on POST; a matching
 * host means the request came from our own pages. Requests with no origin
 * (curl, server-to-server) are allowed through so health checks and tooling
 * still work — the rate limiter is the backstop for those.
 */
export function sameOriginOnly(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;

  const host = req.headers.get("host");
  try {
    if (new URL(origin).host !== host) {
      return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }
  return null;
}
