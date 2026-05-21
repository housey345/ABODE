"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import PropertyCard from "@/components/PropertyCard";
import ScrollToTop from "@/components/ScrollToTop";
import type { Property } from "@/lib/properties";

const VoiceSearch = dynamic(() => import("@/components/VoiceSearch"), { ssr: false });

interface SearchResult {
  property: Property;
  score: number;
  explanation: string;
}

interface SearchResponse {
  intent: {
    beds?: number;
    max_price?: number;
    near?: string[];
    summary?: string;
  };
  results: SearchResult[];
  total: number;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) { router.push("/"); return; }

    setLoading(true);
    setData(null);

    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError("Search failed. Please try again."); setLoading(false); });
  }, [query, router]);

  const handleVoiceTranscript = (text: string) => {
    if (text.trim()) router.push(`/results?q=${encodeURIComponent(text.trim())}`);
  };

  return (
    <main className="min-h-screen bg-brand-ivory">
      {/* ── Sticky header ── */}
      <header
        className="bg-brand-charcoal sticky top-0 z-20"
        style={{ borderBottom: "1px solid rgba(200,160,102,0.18)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-5">
          <Link href="/" className="shrink-0 flex items-center gap-2">
            <Image src="/images/logo_icon.svg" width={32} height={32} alt="" priority />
            <Image src="/images/logo_text.svg" width={88} height={18} alt="ABODE" priority className="hidden sm:block" />
          </Link>

          <span className="hidden md:block h-6 w-px bg-white/10 mx-1" />

          <SearchBar initialQuery={query} onVoiceTranscript={handleVoiceTranscript} />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        {loading && <LoadingState />}

        {error && (
          <div className="text-center py-28">
            <p className="eyebrow text-brand-grey mb-3">Something went amiss</p>
            <p className="font-display font-light text-2xl text-brand-charcoal mb-8">{error}</p>
            <Link
              href="/"
              className="text-[11px] font-sans font-semibold tracking-[0.22em] uppercase text-brand-charcoal hover:text-brand-gold transition-colors duration-500 inline-flex items-center gap-3 group"
            >
              Return home
              <span className="block w-10 h-px bg-current group-hover:w-14 transition-all duration-500" />
            </Link>
          </div>
        )}

        {data && !loading && (
          <>
            <ConciergeNote summary={data.intent.summary} query={query} count={data.total} intent={data.intent} />

            {data.results.length === 0 ? (
              <NoResults query={query} />
            ) : (
              <>
                <ResultsHeader count={data.total} query={query} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
                  {data.results.map((r, i) => (
                    <PropertyCard
                      key={r.property.id}
                      property={r.property}
                      explanation={r.explanation}
                      index={i}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <ScrollToTop />
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResultsContent />
    </Suspense>
  );
}

function SearchBar({
  initialQuery,
  onVoiceTranscript,
}: {
  initialQuery: string;
  onVoiceTranscript: (text: string) => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/results?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex items-stretch min-w-0 h-10">
      <div
        className="flex items-center flex-1 min-w-0 h-full"
        style={{ border: "1px solid rgba(255,255,255,0.12)", borderRight: "none" }}
      >
        <VoiceSearch onTranscript={onVoiceTranscript} compact />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Refine your search…"
          className="flex-1 min-w-0 bg-transparent text-white placeholder:text-white/35 text-sm px-3 outline-none font-sans tracking-wide h-full"
        />
      </div>
      <button
        type="submit"
        className="bg-brand-gold hover:bg-brand-gold-light text-brand-charcoal text-[11px] font-sans font-semibold tracking-[0.18em] uppercase px-4 sm:px-6 transition-colors duration-500 shrink-0"
      >
        Search
      </button>
    </form>
  );
}

/**
 * Concierge note — replaces the "AI Summary" card. Reads as a hand-written
 * note from Isla rather than a chat reply. Hairline gold rule on the left.
 */
function ConciergeNote({
  summary,
  query,
  count,
  intent,
}: {
  summary?: string;
  query: string;
  count: number;
  intent: SearchResponse["intent"];
}) {
  const tags: string[] = [];
  if (intent.beds) tags.push(`${intent.beds} bed`);
  if (intent.max_price) tags.push(`under £${(intent.max_price / 1000).toFixed(0)}k`);
  if (intent.near?.includes("school")) tags.push("near school");
  if (intent.near?.includes("station")) tags.push("near station");
  if (intent.near?.includes("park")) tags.push("near park");

  return (
    <div
      className="relative bg-white p-8 lg:p-10 mb-10 lg:mb-14 animate-fade-in overflow-hidden"
      style={{ border: "1px solid #E7E1D9" }}
    >
      {/* Left gold rule */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-brand-gold" />

      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        <div className="shrink-0 flex items-center gap-3">
          <span className="eyebrow text-brand-gold">A Note from Isla</span>
          <span className="hidden sm:block h-px w-8 bg-brand-gold/40" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display font-light text-[22px] sm:text-2xl lg:text-[28px] text-brand-charcoal leading-[1.32] tracking-tight">
            I&apos;ve found {count} development{count !== 1 ? "s" : ""}{" "}
            {summary ? (
              <>matching {summary}.</>
            ) : (
              <>for <em className="italic">&ldquo;{query}&rdquo;</em>.</>
            )}
          </p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="text-brand-charcoal text-[11px] font-sans tracking-[0.14em] uppercase px-3 py-1.5"
                  style={{ border: "1px solid rgba(200,160,102,0.42)", background: "rgba(200,160,102,0.06)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsHeader({ count }: { count: number; query: string }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-8 lg:mb-10">
      <div className="flex items-baseline gap-4">
        <span className="font-display font-light text-brand-gold text-3xl lg:text-4xl tabular-nums leading-none">
          {String(count).padStart(2, "0")}
        </span>
        <span className="eyebrow text-brand-charcoal">
          {count === 1 ? "Development" : "Developments"}
        </span>
      </div>
      <span className="hidden sm:block flex-1 hairline mb-3" />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="h-28 shimmer-bg" />
      <div className="h-6 w-48 shimmer-bg mt-10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8 mt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden" style={{ border: "1px solid #E7E1D9" }}>
            <div className="aspect-[5/4] shimmer-bg" />
            <div className="p-5 bg-white space-y-3">
              <div className="h-3 w-1/3 shimmer-bg" />
              <div className="h-5 w-3/4 shimmer-bg" />
              <div className="h-3 w-1/2 shimmer-bg" />
              <div className="flex gap-4 pt-3">
                <div className="h-7 w-12 shimmer-bg" />
                <div className="h-7 w-12 shimmer-bg" />
                <div className="h-7 w-12 shimmer-bg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="text-center py-24 lg:py-32 max-w-md mx-auto">
      <p className="eyebrow text-brand-gold mb-5">Nothing matched — yet</p>
      <h2 className="font-display font-light text-3xl lg:text-4xl text-brand-charcoal mb-5 tracking-tight">
        <em className="italic">&ldquo;{query}&rdquo;</em>
      </h2>
      <p className="text-brand-grey text-sm mb-10 leading-relaxed font-sans font-light">
        Try widening the budget, removing a filter, or asking Isla a different way.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-3 bg-brand-charcoal text-brand-ivory text-[11px] font-sans font-semibold tracking-[0.22em] uppercase px-10 py-4 hover:bg-brand-gold hover:text-brand-charcoal transition-colors duration-500 group"
      >
        Begin a new search
        <span className="block w-6 h-px bg-current group-hover:w-10 transition-all duration-500" />
      </Link>
    </div>
  );
}
