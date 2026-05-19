"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { properties } from "@/lib/properties";

const VoiceSearch = dynamic(() => import("@/components/VoiceSearch"), { ssr: false });

const PROMPTS = [
  "3 bed family home near schools under £400k",
  "Modern apartment near Edinburgh city centre",
  "4 bedroom house with good transport links",
  "Commuter-friendly home in west Edinburgh",
];

// Curated three for the editorial selection strip
const FEATURED_IDS = [34931, 31873, 41956];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const desktopInputRef = useRef<HTMLInputElement>(null);

  const featured = FEATURED_IDS
    .map((id) => properties.find((p) => p.id === id))
    .filter(Boolean) as typeof properties;

  const handleSearch = (q?: string) => {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery) return;
    setLoading(true);
    router.push(`/results?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleVoiceTranscript = (text: string) => {
    setQuery(text);
    setTimeout(() => handleSearch(text), 300);
  };

  return (
    <>
      {/* ═════════ HERO — refined dusk, full viewport ═════════ */}
      <section className="relative min-h-screen flex flex-col overflow-hidden grain bg-brand-charcoal">
        <HeroBg />

        {/* Editorial masthead detail — top-left serial */}
        <span className="hidden lg:block absolute top-8 left-6 z-10 eyebrow text-white/30">
          Vol. 01 · MMXXVI
        </span>
        <span className="hidden lg:block absolute top-8 right-6 z-10 eyebrow text-white/30">
          Edinburgh · Scotland
        </span>

        {/* ── Navigation ── */}
        <nav className="relative z-10 flex items-center justify-between px-6 pt-10 pb-5 sm:px-10 lg:px-14 lg:pt-16">
          <div className="flex-1 hidden md:flex items-center gap-9 text-white/55 text-[11px] font-sans font-medium tracking-[0.18em] uppercase">
            <Link href="#selection" className="gold-underline hover:text-white transition-colors duration-500">Browse</Link>
            <Link href="#" className="gold-underline hover:text-white transition-colors duration-500">Developments</Link>
            <Link href="#" className="gold-underline hover:text-white transition-colors duration-500">Journal</Link>
            <Link href="#" className="gold-underline hover:text-white transition-colors duration-500">About</Link>
          </div>

          <AbodeLogo />

          <div className="flex-1 flex items-center justify-end gap-3">
            <button className="hidden md:block text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-white/70 hover:text-brand-gold transition-colors duration-500">
              Register Interest
            </button>

            <button
              className="md:hidden flex flex-col justify-center items-center gap-[5px] w-10 h-10 text-white/60 hover:text-white transition-colors duration-300 shrink-0"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
              ) : (
                <>
                  <span className="block w-5 h-px bg-current" />
                  <span className="block w-4 h-px bg-current ml-auto" />
                  <span className="block w-5 h-px bg-current" />
                </>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile slide-down menu */}
        {menuOpen && (
          <div
            className="relative z-10 md:hidden animate-fade-in"
            style={{ borderBottom: "1px solid rgba(200,160,102,0.15)" }}
          >
            <div
              className="px-6 py-8 space-y-6"
              style={{ background: "rgba(13,20,20,0.97)", backdropFilter: "blur(20px)" }}
            >
              {["Browse", "Developments", "Journal", "About"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  onClick={() => setMenuOpen(false)}
                  className="block text-white/55 hover:text-white text-sm font-sans tracking-[0.22em] uppercase transition-colors duration-300"
                >
                  {item}
                </Link>
              ))}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1.5rem" }}>
                <button className="w-full text-xs font-sans font-semibold tracking-[0.18em] uppercase text-brand-gold border border-brand-gold/40 py-3.5 hover:bg-brand-gold hover:text-brand-charcoal transition-all duration-500">
                  Register Interest
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MOBILE HERO ── */}
        <div className="md:hidden relative z-10 flex flex-col flex-1 px-6 pt-6 pb-14">
          <div className="text-center mb-12 rise-in">
            <p className="eyebrow text-white/35 mb-6">All New Build Homes in Scotland</p>
            <h1 className="font-display font-light text-[2.85rem] leading-[1.02] text-white tracking-tight">
              Find your{" "}
              <em className="not-italic" style={{ color: "#C8A066" }}>perfect</em>
              <br />new build.
            </h1>
            <p className="mt-5 text-white/45 text-[13px] font-sans leading-relaxed font-light max-w-xs mx-auto">
              An AI concierge for Scotland&apos;s finest new developments.
            </p>
          </div>

          <div className="flex flex-col w-full rise-in" style={{ animationDelay: "180ms" }}>
            <VoiceSearch onTranscript={handleVoiceTranscript} disabled={loading} />

            <div className="flex items-center gap-4 my-7">
              <span className="flex-1 hairline-dark" />
              <span className="text-white/30 text-[10px] font-sans tracking-[0.3em] uppercase">or type</span>
              <span className="flex-1 hairline-dark" />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <div
                className="flex items-center gap-3 px-5 py-5 w-full"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(200,160,102,0.30)",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.30)",
                }}
              >
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe your ideal home…"
                  className="flex-1 bg-transparent text-white placeholder:text-white/45 text-[15px] font-sans outline-none tracking-wide"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="shrink-0 text-brand-gold/70 hover:text-brand-gold transition-colors duration-500 disabled:opacity-30"
                >
                  <SearchArrowIcon size={20} />
                </button>
              </div>
            </form>

            <div className="mt-6 -mx-6">
              <div className="overflow-x-auto scrollbar-none">
                <div className="flex gap-2 px-6 w-max">
                  {PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleSearch(p)}
                      disabled={loading}
                      className="text-white/40 hover:text-white/85 text-[11px] font-sans border border-white/10 hover:border-brand-gold/40 px-3.5 py-2 transition-all duration-500 disabled:opacity-40 tracking-wide whitespace-nowrap"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── DESKTOP HERO ── */}
        <div className="hidden md:flex relative z-10 flex-col items-center justify-center flex-1 px-10 lg:px-14 pb-32 text-center">
          <p className="eyebrow text-white/45 mb-7 rise-in">A New Chapter · A New Standard</p>

          <h1
            className="font-display font-light text-6xl lg:text-[5.5rem] xl:text-[6.25rem] text-white leading-[0.98] tracking-tight max-w-5xl rise-in"
            style={{ animationDelay: "120ms" }}
          >
            Ask Isla to find your
            <br />
            <em className="not-italic italic" style={{ color: "#C8A066", fontStyle: "italic" }}>
              perfect
            </em>{" "}
            new build home.
          </h1>

          <p
            className="mt-9 text-white/55 text-base lg:text-[17px] font-sans font-light tracking-wide leading-relaxed max-w-md rise-in"
            style={{ animationDelay: "220ms" }}
          >
            A quietly intelligent concierge for Scotland&apos;s most considered new
            developments. Speak, and she listens.
          </p>

          <div
            className="w-full max-w-2xl mt-12 rise-in"
            style={{ animationDelay: "340ms" }}
          >
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <div
                className="flex items-center gap-4 px-6 py-5"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(200,160,102,0.32)",
                  boxShadow: "0 0 0 1px rgba(200,160,102,0.08), 0 8px 32px rgba(0,0,0,0.35)",
                }}
              >
                <VoiceSearch onTranscript={handleVoiceTranscript} disabled={loading} compact />
                <input
                  ref={desktopInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe what you're looking for…"
                  className="flex-1 bg-transparent text-white placeholder:text-white/45 text-[15px] font-sans outline-none tracking-wide"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  disabled={loading || !query.trim()}
                  className="text-brand-gold/70 hover:text-brand-gold transition-colors duration-500 disabled:opacity-30 shrink-0"
                >
                  <SearchArrowIcon size={20} />
                </button>
              </div>
            </form>

            <div className="mt-10">
              <p className="eyebrow text-white/30 mb-4">Suggested</p>
              <div className="flex flex-wrap justify-center gap-2">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSearch(p)}
                    disabled={loading}
                    className="text-white/45 hover:text-white text-[11px] font-sans border border-white/10 hover:border-brand-gold/45 px-3.5 py-2 transition-all duration-500 disabled:opacity-40 tracking-wide"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue — desktop only */}
        <Link
          href="#selection"
          className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-2 text-white/35 hover:text-brand-gold transition-colors duration-500"
        >
          <span className="eyebrow">Scroll</span>
          <span className="block w-px h-8 bg-current" />
        </Link>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-30 bg-brand-charcoal/92 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="w-10 h-10 border border-brand-gold border-t-transparent animate-spin mx-auto mb-6" />
              <p className="text-white/55 eyebrow">Isla is searching</p>
            </div>
          </div>
        )}
      </section>

      {/* ═════════ FEATURED SELECTION ═════════ */}
      <section
        id="selection"
        className="relative bg-brand-ivory text-brand-charcoal py-24 lg:py-32 px-6 sm:px-10 lg:px-14"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-12 mb-14 lg:mb-20">
            <div>
              <p className="eyebrow text-brand-gold mb-5">The Selection · No. 01</p>
              <h2 className="font-display font-light text-4xl lg:text-6xl leading-[1.05] tracking-tight max-w-2xl">
                A considered shortlist of <em className="italic" style={{ color: "#C8A066" }}>new developments</em>.
              </h2>
            </div>
            <p className="text-brand-grey text-sm lg:text-[15px] font-sans font-light leading-relaxed max-w-sm">
              Eleven developments across Edinburgh, curated for craft, location and the quiet certainty of a good home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
            {featured.map((p, i) => (
              <FeaturedCard key={p.id} property={p} index={i} />
            ))}
          </div>

          <div className="mt-16 lg:mt-20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <span className="hairline flex-1 hidden sm:block" />
            <Link
              href="/results?q=Edinburgh new build"
              className="text-[11px] font-sans font-semibold tracking-[0.24em] uppercase text-brand-charcoal hover:text-brand-gold transition-colors duration-500 flex items-center gap-3 group"
            >
              View all developments
              <span className="block w-10 h-px bg-current group-hover:w-14 transition-all duration-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═════════ PHILOSOPHY ═════════ */}
      <section className="bg-white text-brand-charcoal py-24 lg:py-32 px-6 sm:px-10 lg:px-14">
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow text-brand-gold mb-7">Find Your Humble Abode</p>
          <p className="font-display font-light text-3xl sm:text-4xl lg:text-5xl leading-[1.18] tracking-tight">
            &ldquo;A home is the longest conversation you&apos;ll ever have with a place.
            We help you find one worth answering.&rdquo;
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className="block w-12 h-px bg-brand-gold" />
            <span className="eyebrow text-brand-grey">Isla, in residence</span>
            <span className="block w-12 h-px bg-brand-gold" />
          </div>
        </div>
      </section>

      {/* ═════════ FOOTER ═════════ */}
      <Footer />
    </>
  );
}

function AbodeLogo() {
  return (
    <Link href="/" className="flex items-center justify-center">
      <Image src="/images/logo_abode.svg" width={52} height={52} alt="ABODE" priority />
    </Link>
  );
}

function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src="/images/bck_hdr.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Dark tint — preserves text legibility */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(13,21,22,0.55)" }}
      />

      {/* Bottom shadow — anchors the type */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "55%",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(8,14,16,0.45) 45%, rgba(8,14,16,0.85) 100%)",
        }}
      />

      {/* Top shadow — frames the nav */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "32%",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.50) 0%, transparent 100%)",
        }}
      />

      {/* Warm gold horizon glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 24% at 50% 72%, rgba(200,160,102,0.18) 0%, rgba(200,160,102,0.06) 45%, transparent 75%)",
        }}
      />

      {/* Single hairline horizon — brand mark */}
      <div
        className="absolute left-0 right-0"
        style={{ top: "72%", height: "1px", background: "rgba(200,160,102,0.16)" }}
      />
    </div>
  );
}

function SearchArrowIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeaturedCard({ property, index }: { property: (typeof properties)[number]; index: number }) {
  const price = `£${(property.price_min / 1000).toFixed(0)}k`;
  return (
    <Link
      href={`/property/${property.id}`}
      className="group block rise-in"
      style={{ animationDelay: `${index * 140}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-stone mb-5">
        {property.images[0] && (
          <Image
            src={property.images[0]}
            alt={property.name}
            fill
            className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
        <span
          className="absolute top-4 left-4 eyebrow text-white px-2.5 py-1"
          style={{ background: "rgba(27,43,43,0.78)", backdropFilter: "blur(6px)" }}
        >
          {String(index + 1).padStart(2, "0")} · Selection
        </span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow text-brand-grey mb-1.5">{property.developer}</p>
          <h3 className="font-display font-light text-2xl lg:text-[26px] text-brand-charcoal leading-tight tracking-tight">
            {property.name}
          </h3>
          <p className="text-brand-grey text-xs font-sans tracking-wide mt-1.5">
            {property.locality} · {property.postal_code}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="eyebrow text-brand-grey mb-1">From</p>
          <p className="font-display font-light text-2xl text-brand-charcoal leading-none">
            {price}
          </p>
        </div>
      </div>
    </Link>
  );
}

function Footer() {
  return (
    <footer className="bg-brand-charcoal text-white/70 pt-20 pb-10 px-6 sm:px-10 lg:px-14 grain relative">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14 pb-14 border-b border-white/[0.07]">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex flex-col items-start gap-2">
              <Image src="/images/logo_abode.svg" width={48} height={48} alt="ABODE" />
            </div>
            <p className="mt-6 text-white/45 text-[13px] font-sans font-light leading-relaxed max-w-xs">
              All new build homes in Scotland. Found, listened-for, by Isla.
            </p>
          </div>

          <FooterCol
            heading="Explore"
            links={[
              ["Browse Homes", "/results?q=Edinburgh new build"],
              ["Developments", "#"],
              ["Locations", "#"],
              ["Journal", "#"],
            ]}
          />
          <FooterCol
            heading="Company"
            links={[
              ["About", "#"],
              ["Press", "#"],
              ["Careers", "#"],
              ["Contact", "#"],
            ]}
          />
          <FooterCol
            heading="Connect"
            links={[
              ["Instagram", "#"],
              ["LinkedIn", "#"],
              ["Newsletter", "#"],
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-white/35 text-[11px] font-sans tracking-[0.2em] uppercase">
            © MMXXVI ABODE · Edinburgh, Scotland
          </p>
          <p className="text-white/30 text-[11px] font-sans tracking-[0.2em] uppercase">
            Find Your Humble Abode
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ heading, links }: { heading: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow text-brand-gold mb-5">{heading}</p>
      <ul className="space-y-3">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="text-white/60 hover:text-white text-[13px] font-sans tracking-wide transition-colors duration-500"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
