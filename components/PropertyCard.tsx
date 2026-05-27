"use client";

import Link from "next/link";
import Image from "next/image";
import { Property } from "@/lib/properties";

interface Props {
  property: Property;
  explanation?: string;
  index?: number;
}

function formatPrice(p: number) {
  return `£${(p / 1000).toFixed(0)}k`;
}

export default function PropertyCard({ property: p, explanation, index = 0 }: Props) {
  const heroImage = p.images[0];
  const bedsLabel = p.bedrooms.length === 1
    ? `${p.bedrooms[0]} bed`
    : `${p.bedrooms[0]}–${p.bedrooms[p.bedrooms.length - 1]} bed`;

  return (
    <Link
      href={`/property/${p.id}`}
      className="group block animate-slide-up"
      style={{ animationDelay: `${index * 90}ms`, animationFillMode: "both", opacity: 0 }}
    >
      <article className="bg-white border border-brand-stone transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-24px_rgba(27,43,43,0.18)]">
        {/* ── Image, no overlay — let the architecture speak ── */}
        <div className="relative aspect-[5/4] overflow-hidden bg-brand-stone">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={p.name}
              fill
              className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.045]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="eyebrow text-brand-grey">No image</span>
            </div>
          )}

          {/* Small index marker — editorial */}
          <span className="absolute top-3 left-3 eyebrow text-white px-2 py-0.5"
            style={{ background: "rgba(27,43,43,0.78)", backdropFilter: "blur(4px)" }}
          >
            № {String(index + 1).padStart(2, "0")}
          </span>

          {/* Beds tag — gold, square */}
          <span
            className="absolute bottom-3 right-3 bg-brand-gold text-brand-charcoal text-[10px] font-sans font-semibold tracking-[0.16em] uppercase px-2.5 py-1"
          >
            {bedsLabel}
          </span>
        </div>

        {/* ── Type block — editorial hierarchy ── */}
        <div className="px-5 pt-5 pb-5">
          <p className="eyebrow text-brand-grey mb-2">{p.developer}</p>

          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display font-light text-[22px] text-brand-charcoal leading-[1.1] tracking-tight">
              {p.name}
            </h3>
            <p className="font-display font-light text-[22px] text-brand-charcoal leading-none whitespace-nowrap">
              {formatPrice(p.price_min)}
            </p>
          </div>

          <p className="text-brand-grey text-xs font-sans tracking-wide mt-1.5">
            {p.locality} · {p.postal_code}
          </p>

          {explanation && (
            <p className="text-brand-charcoal/70 text-[13px] mt-4 leading-relaxed line-clamp-2 font-sans font-light italic">
              &ldquo;{explanation}&rdquo;
            </p>
          )}

          <div className="hairline mt-5 mb-4" />

          {/* Amenities — compact spec strip */}
          <div className="grid grid-cols-3 gap-3">
            <SpecCell label="School" mins={p.nearest_school?.mins} />
            <SpecCell label="Station" mins={p.nearest_station?.mins} />
            <SpecCell label="Park" mins={p.nearest_park?.mins} />
          </div>

          {/* Hover-revealed CTA arrow */}
          <div className="mt-5 flex items-center justify-between">
            <span className="eyebrow text-brand-grey">View Development</span>
            <span className="block h-px bg-brand-charcoal/15 flex-1 mx-4 group-hover:bg-brand-gold transition-colors duration-500" />
            <svg
              width="20" height="12" viewBox="0 0 20 12" fill="none"
              className="text-brand-charcoal/40 group-hover:text-brand-gold group-hover:translate-x-1 transition-all duration-500"
            >
              <path d="M1 6h17M13 1l5 5-5 5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}

function SpecCell({ label, mins }: { label: string; mins?: number }) {
  const isClose = mins != null && mins <= 10;
  return (
    <div className="flex flex-col">
      <span className="eyebrow text-brand-grey mb-1">{label}</span>
      <span className={`font-display font-light text-lg leading-none ${isClose ? "text-brand-gold" : "text-brand-charcoal"}`}>
        {mins != null ? (
          <>{mins}<span className="text-[11px] font-sans font-normal tracking-wider ml-0.5">min</span></>
        ) : (
          <span className="text-brand-grey text-sm">—</span>
        )}
      </span>
    </div>
  );
}
