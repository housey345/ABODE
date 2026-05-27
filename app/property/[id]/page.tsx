"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ScrollToTop from "@/components/ScrollToTop";
import type { Property } from "@/lib/properties";

export default function PropertyPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [enquiring, setEnquiring] = useState(false);

  useEffect(() => {
    fetch(`/api/property/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => { setProperty(d); setLoading(false); })
      .catch(() => { router.push("/"); });
  }, [params.id, router]);

  if (loading) return <LoadingScreen />;
  if (!property) return null;

  const p = property;
  const bedsLabel = p.bedrooms.length === 1
    ? `${p.bedrooms[0]} bedroom`
    : `${p.bedrooms[0]}–${p.bedrooms[p.bedrooms.length - 1]} bedrooms`;

  return (
    <main className="min-h-screen bg-brand-ivory pb-28 lg:pb-0">
      {/* ── Header ── */}
      <header
        className="bg-brand-charcoal sticky top-0 z-30"
        style={{ borderBottom: "1px solid rgba(200,160,102,0.18)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo_icon.svg" width={32} height={32} alt="" priority />
            <Image src="/images/logo_text.svg" width={88} height={18} alt="ABODE" priority className="hidden sm:block" />
          </Link>
          <button
            onClick={() => router.back()}
            className="text-white/55 hover:text-white text-[11px] font-sans tracking-[0.22em] uppercase flex items-center gap-3 transition-colors duration-500 group"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
            Back to results
          </button>
        </div>
      </header>

      {/* ═════════ CINEMATIC GALLERY ═════════ */}
      <Gallery images={p.images} active={activeImage} onSelect={setActiveImage} name={p.name} />

      {/* ═════════ TITLE STRIP — editorial masthead ═════════ */}
      <section className="bg-white border-b border-brand-stone">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-10">
            <div>
              <p className="eyebrow text-brand-gold mb-3">{p.developer} · {p.locality}</p>
              <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-[64px] text-brand-charcoal leading-[1.02] tracking-tight">
                {p.name}
              </h1>
            </div>
            <div className="lg:text-right">
              <p className="eyebrow text-brand-grey mb-2">Price From</p>
              <p className="font-display font-light text-4xl lg:text-5xl text-brand-charcoal leading-none">
                £{p.price_min.toLocaleString()}
              </p>
              <p className="text-brand-grey text-xs font-sans tracking-wide mt-2">{p.bedrooms_text}</p>
            </div>
          </div>

          {/* Spec sheet strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px mt-10 lg:mt-14 bg-brand-stone">
            <SpecBox label="Bedrooms" value={bedsLabel.replace(" bedroom", "")} unit="bed" />
            <SpecBox label="Locality" value={p.locality} />
            <SpecBox label="Postcode" value={p.postal_code} />
            <SpecBox label="Type" value="New Build" highlight />
          </div>
        </div>
      </section>

      {/* ═════════ BODY ═════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          {/* ── Long-form content ── */}
          <div className="lg:col-span-2 space-y-12 lg:space-y-16">
            {p.description && (
              <section>
                <SectionHead num="01" label="About This Development" />
                <p className="text-brand-charcoal text-base lg:text-[17px] leading-[1.7] font-sans font-light mt-6 max-w-2xl">
                  {p.description}
                </p>
              </section>
            )}

            <section>
              <SectionHead num="02" label="The Surroundings" />
              <div className="mt-6 divide-y divide-brand-stone">
                <AmenityRow category="Nearest School" name={p.nearest_school?.name} km={p.nearest_school?.km} mins={p.nearest_school?.mins} />
                <AmenityRow category="Nearest Station" name={p.nearest_station?.name} km={p.nearest_station?.km} mins={p.nearest_station?.mins} />
                <AmenityRow category="Nearest Park" name={p.nearest_park?.name} km={p.nearest_park?.km} mins={p.nearest_park?.mins} />
              </div>
            </section>

            <section>
              <SectionHead num="03" label="Location" />
              <MapPreviewLight lat={p.lat} lng={p.lng} name={p.name} />
            </section>
          </div>

          {/* ── Booking sidebar ── */}
          <aside className="hidden lg:block">
            <div
              className="bg-brand-charcoal text-white p-8 sticky top-24"
              style={{ border: "1px solid rgba(200,160,102,0.22)" }}
            >
              <p className="eyebrow text-brand-gold mb-2">Register Interest</p>
              <p className="font-display font-light text-4xl text-white leading-none mt-3">
                £{p.price_min.toLocaleString()}
              </p>
              <p className="text-white/45 text-xs font-sans tracking-wide mt-2.5">
                {p.bedrooms_text}
              </p>

              <div className="mt-7 pt-7 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                {enquiring ? (
                  <div
                    className="p-5 text-center"
                    style={{ border: "1px solid rgba(200,160,102,0.42)", background: "rgba(200,160,102,0.07)" }}
                  >
                    <p className="text-brand-gold eyebrow mb-2">Enquiry Sent</p>
                    <p className="text-white/55 text-xs font-sans font-light leading-relaxed">
                      We&apos;ll be in touch shortly.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setEnquiring(true)}
                    className="w-full bg-brand-gold hover:bg-white text-brand-charcoal text-[11px] font-sans font-semibold tracking-[0.22em] uppercase py-4 transition-colors duration-500"
                  >
                    Register Interest
                  </button>
                )}
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center text-white/65 hover:text-white text-[11px] font-sans font-medium tracking-[0.22em] uppercase py-4 transition-colors duration-500"
                  style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  Developer Site →
                </a>
              </div>

              <div
                className="mt-7 pt-7 flex items-start gap-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                <svg width="22" height="22" viewBox="0 0 40 44" fill="none" className="shrink-0 mt-0.5">
                  <path d="M20 3L37 16V41H3V16L20 3Z" stroke="var(--abode-gold)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                  <circle cx="20" cy="20" r="3" stroke="var(--abode-gold)" strokeWidth="1.25" fill="none" />
                </svg>
                <div>
                  <p className="eyebrow text-brand-gold mb-1.5">Concierge</p>
                  <p className="text-white/55 text-xs leading-relaxed font-sans font-light">
                    Isla can arrange a viewing, request floorplans, or compare this home with others nearby.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ═════════ Mobile sticky CTA ═════════ */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-brand-charcoal"
        style={{ borderTop: "1px solid rgba(200,160,102,0.22)" }}
      >
        <div className="flex items-center gap-0 px-4 py-3 max-w-5xl mx-auto">
          <div className="flex-1 min-w-0 pr-4">
            <p className="eyebrow text-white/45">Price From</p>
            <p className="font-display font-light text-2xl text-white leading-tight mt-1">
              £{p.price_min.toLocaleString()}
            </p>
          </div>
          {enquiring ? (
            <div
              className="px-5 py-3 text-center shrink-0"
              style={{ border: "1px solid rgba(200,160,102,0.42)", background: "rgba(200,160,102,0.08)" }}
            >
              <p className="text-brand-gold eyebrow">Enquiry Sent</p>
            </div>
          ) : (
            <button
              onClick={() => setEnquiring(true)}
              className="bg-brand-gold hover:bg-white text-brand-charcoal text-[11px] font-sans font-semibold tracking-[0.22em] uppercase px-7 py-4 transition-colors duration-500 shrink-0"
            >
              Register Interest
            </button>
          )}
        </div>
      </div>
      <ScrollToTop />
    </main>
  );
}

/**
 * Cinematic gallery — taller hero, hairline frame, square-edge thumbnail rail.
 */
function Gallery({ images, active, onSelect, name }: {
  images: string[];
  active: number;
  onSelect: (i: number) => void;
  name: string;
}) {
  if (!images.length) return null;

  return (
    <div className="bg-brand-charcoal">
      <div className="relative h-[60vh] sm:h-[68vh] lg:h-[78vh] overflow-hidden">
        <Image
          src={images[active]}
          alt={name}
          fill
          className="object-cover animate-ken-burns"
          priority
          sizes="100vw"
          key={active}
        />

        {/* Quiet vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.35) 100%)" }}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => onSelect((active - 1 + images.length) % images.length)}
              className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white hover:text-brand-charcoal hover:bg-brand-gold transition-colors duration-500"
              style={{ border: "1px solid rgba(255,255,255,0.4)", backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.18)" }}
              aria-label="Previous image"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </button>
            <button
              onClick={() => onSelect((active + 1) % images.length)}
              className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white hover:text-brand-charcoal hover:bg-brand-gold transition-colors duration-500"
              style={{ border: "1px solid rgba(255,255,255,0.4)", backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.18)" }}
              aria-label="Next image"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <span className="font-display font-light text-white text-xl tabular-nums">
                {String(active + 1).padStart(2, "0")}
              </span>
              <span className="block w-10 h-px bg-brand-gold" />
              <span className="text-white/55 text-[11px] font-sans tracking-[0.22em] uppercase tabular-nums">
                of {String(images.length).padStart(2, "0")}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Thumbnail rail */}
      {images.length > 1 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {images.slice(0, 8).map((src, i) => (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className={`relative flex-shrink-0 w-20 h-14 overflow-hidden transition-all duration-500 ${
                  i === active ? "opacity-100" : "opacity-40 hover:opacity-80"
                }`}
                style={i === active ? { outline: "1px solid var(--abode-gold)", outlineOffset: "-1px" } : {}}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHead({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-display font-light text-brand-gold text-2xl tabular-nums">{num}</span>
      <span className="block w-10 h-px bg-brand-gold" />
      <span className="eyebrow text-brand-charcoal">{label}</span>
    </div>
  );
}

function SpecBox({ label, value, unit, highlight }: { label: string; value: string; unit?: string; highlight?: boolean }) {
  return (
    <div
      className={`p-5 lg:p-6 flex flex-col gap-2 ${highlight ? "bg-brand-charcoal text-white" : "bg-white text-brand-charcoal"}`}
    >
      <span className={`eyebrow ${highlight ? "text-brand-gold" : "text-brand-grey"}`}>{label}</span>
      <span className="font-display font-light text-2xl lg:text-[28px] leading-none tracking-tight">
        {value}
        {unit && <span className="text-xs font-sans font-normal tracking-wider ml-1.5">{unit}</span>}
      </span>
    </div>
  );
}

function AmenityRow({ category, name, km, mins }: {
  category: string;
  name?: string;
  km?: number;
  mins?: number;
}) {
  const isClose = km != null && km <= 0.5;
  return (
    <div className="flex items-center gap-4 py-5 lg:py-6">
      <div className="flex-1 min-w-0">
        <p className="eyebrow text-brand-grey mb-2">{category}</p>
        <p className="font-display font-light text-xl lg:text-2xl text-brand-charcoal leading-tight truncate">{name ?? "—"}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-display font-light text-3xl lg:text-4xl leading-none ${isClose ? "text-brand-gold" : "text-brand-charcoal"}`}>
          {mins != null ? <>{mins}<span className="text-xs font-sans font-normal tracking-wider ml-1">min</span></> : "—"}
        </p>
        <p className="text-brand-grey text-xs font-sans tracking-wide mt-2">{km != null ? `${km} km` : ""}</p>
      </div>
    </div>
  );
}

function MapPreviewLight({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const mapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=14`;
  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block relative h-56 lg:h-72 mt-6 group overflow-hidden border border-brand-stone bg-brand-stone"
    >
      {/* Tactile architectural grid pattern as map stand-in */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(27,43,43,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(27,43,43,0.10) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-brand-charcoal">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.25" fill="var(--abode-gold)" />
        </svg>
        <p className="font-display font-light text-xl text-brand-charcoal text-center px-6 leading-tight">{name}</p>
        <span className="text-[11px] font-sans tracking-[0.22em] uppercase text-brand-charcoal group-hover:text-brand-gold transition-colors duration-500 flex items-center gap-2">
          Open in map
          <span className="block w-6 h-px bg-current group-hover:w-10 transition-all duration-500" />
        </span>
      </div>
    </a>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-brand-ivory flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border border-brand-gold border-t-transparent animate-spin mx-auto mb-6" />
        <p className="eyebrow text-brand-grey">Loading</p>
      </div>
    </main>
  );
}
