# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Next.js dev server (default http://localhost:3000)
npm run build     # production build
npm run start     # serve the built app
npm run lint      # eslint (eslint-config-next)
```

No test runner is configured.

`OPENAI_API_KEY` lives in `.env.local` (Next.js server-side only — never expose with `NEXT_PUBLIC_`). If it's missing or the literal placeholder `your_openai_api_key_here`, `lib/openai.ts` silently falls back to a regex-based parser, so the app stays demoable without a key.

The `openai` npm package is listed in `package.json` but is **not currently used** — `lib/openai.ts` calls the REST API directly via `fetch`. It's kept for Phase 2, which needs the SDK's Realtime WebRTC client (`openai.beta.realtime`) for voice. Don't remove it.

## Architecture

This is **Phase 1** of ABODE: a single-process Next.js 15 App Router demo with an in-memory dataset. Phase 2 (specced in `abode_phase2_spec.md`) keeps the same Next.js shell and swaps the data source for a Laravel + MariaDB backend — read that spec before refactoring `app/api/*` or `lib/properties.ts`, because the current shapes are deliberately the contract Phase 2 must preserve.

**Path alias:** `@/*` → project root (configured in `tsconfig.json`). Import as `@/lib/properties`, `@/components/VoiceSearch`, etc.

### Data flow

1. User submits a query (typed or voice) on `app/page.tsx` → `router.push('/results?q=...')`.
2. `app/results/page.tsx` POSTs `{ query }` to `/api/search`.
3. `app/api/search/route.ts` calls `parseIntent(query)` (`lib/openai.ts`, calls the OpenAI REST API directly via `fetch` using `gpt-4o-mini` with `response_format: json_object`, fallback to regex).
4. Parsed `SearchFilters` (type defined in `lib/properties.ts`, not `lib/openai.ts`) are run through `searchProperties()` — a scoring pass over the static array, returning ranked `{ property, score, explanation }` with a built-in explanation string. The API returns at most 8 results.
5. Results render via `components/PropertyCard.tsx`. The single property page `app/property/[id]/page.tsx` fetches `/api/property/[id]`, which just looks the ID up in the same in-memory array.

`next.config.mjs` whitelists `www.newhomesforsale.co.uk` as a remote image hostname. Add any new external image sources there.

`lib/properties.ts` is the **single source of truth** for the 11-property demo dataset. IDs are the original scraper IDs (`26129`, `29137`, …) and match the image directories under `public/images/{id}/`. Keep those IDs stable — Phase 2 reuses them as the MariaDB primary key.

### Voice search

`components/VoiceSearch.tsx` wraps the browser **Web Speech API** (`window.SpeechRecognition` / `webkitSpeechRecognition`, `lang: "en-GB"`). It's loaded with `next/dynamic({ ssr: false })` from both the home and results pages because it touches `window`. Phase 2 replaces this entire component with an OpenAI Realtime WebRTC client brokered by a new `/api/voice/session` route; until then, the typed-input fallback is the supported path on browsers without SpeechRecognition (Firefox, etc.) — `VoiceSearch` returns `null` when unsupported.

### Scoring (`searchProperties`)

Each property starts at 100 and is adjusted by hard-coded weights for bedroom match, price band, and proximity to `near` POIs (`school` / `station` / `park`). Properties scoring < 50 are dropped. The Phase 2 spec moves this to a SQL ranking query (`ST_Distance_Sphere` + weighted score) — when tweaking weights here, mirror the change in the Phase 2 SQL sketch so behaviour doesn't diverge.

## Brand system (non-negotiable for UI work)

The visual system is editorial / architectural luxury, codified in `abode_brand_spec.md`. Tailwind tokens in `tailwind.config.ts` mirror it:

- **Colours:** `brand-charcoal` `#1B2B2B`, `brand-gold` `#C8A066`, `brand-ivory` `#F6F3EF`, `brand-stone` `#E7E1D9`, `brand-grey` `#6B6B6B`. Also exposed as CSS vars (`--abode-gold`, etc.) in `app/globals.css`.
- **Type:** `font-display` = Cormorant Garamond (headlines, italics for the gold accent words like *perfect*), `font-sans` = Montserrat (UI, eyebrows, all caps with wide tracking). Both load via `next/font/google` in `app/layout.tsx` as CSS variables `--font-cormorant` / `--font-montserrat`.
- **Utilities in `globals.css`:** `.eyebrow` (10px uppercase, 0.3em tracking), `.hairline` / `.hairline-dark` / `.hairline-gold` (1px rules), `.grain` (SVG-noise overlay on dark surfaces), `.gold-underline` (animated hover), `.rise-in` (staggered entrance — use `animationDelay` for sequencing).
- **Rules:** square corners only (no `rounded-*`), large whitespace, thin dividers, no playful easing, no bounce, no neon gradients, no rounded consumer-tech UI. Section backgrounds rotate `ivory → white → stone → charcoal`.

The AI assistant is named **Isla** in user-facing copy ("Ask Isla", "Isla is searching", "Isla, in residence"). Don't rename or genericise her.

## Conventions

- Pages that touch `window`, browser APIs, or `useState` are `"use client"`; everything else stays a server component.
- Use `clsx` (installed) for conditional class names.
- Images use `next/image` with explicit `sizes`; paths are always `/images/{property_id}/NNN.jpeg`.
- Editorial copy uses smart quotes / em-dashes; in JSX escape apostrophes as `&apos;` (lint will fail otherwise).
- The hero on `app/page.tsx` has separately written mobile and desktop layouts (`md:hidden` / `hidden md:flex`) — when restructuring the hero, edit both.

## Reference docs in repo

- `abode_claude_spec.md` — original Phase 1 brief (historical; the app now exceeds it).
- `abode_phase2_spec.md` — authoritative spec for the Laravel/MariaDB/Realtime migration; read before any backend or voice work.
- `abode_brand_spec.md` — brand system source of truth.
- `ABODE Brand Design V1 May 2026.pdf` — visual reference.
