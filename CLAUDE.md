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

**Env vars (all server-side only, never `NEXT_PUBLIC_`):**

| Var | Purpose |
|---|---|
| `OPENAI_API_KEY` | Intent parsing + explanation generation. Missing → regex fallback, app stays demoable. |
| `LARAVEL_API_BASE_URL` | Base URL of the Laravel backend (e.g. `https://api.abode.co.uk`). Absent → Phase 1 in-memory mode. |
| `ABODE_API_TOKEN` | Shared bearer token for Next.js → Laravel calls. Required when `LARAVEL_API_BASE_URL` is set. |

The `openai` npm package is listed in `package.json` but is **not currently used** — `lib/openai.ts` calls the REST API directly via `fetch`. It's kept for future SDK features. Don't remove it.

## Architecture

This is **Phase 1** of ABODE: a single-process Next.js 15 App Router demo with an in-memory dataset. Phase 2 (specced in `abode_phase2_spec.md`) keeps the same Next.js shell and swaps the data source for a Laravel + MariaDB backend — read that spec before refactoring `app/api/*` or `lib/properties.ts`, because the current shapes are deliberately the contract Phase 2 must preserve.

**Path alias:** `@/*` → project root (configured in `tsconfig.json`). Import as `@/lib/properties`, `@/components/VoiceSearch`, etc.

### Data flow

1. User submits a query (typed or voice) on `app/page.tsx` → `router.push('/results?q=...')`.
2. `app/results/page.tsx` POSTs `{ query }` to `/api/search`.
3. `app/api/search/route.ts` calls `parseIntent(query)` (`lib/openai.ts`, calls the OpenAI REST API directly via `fetch` using `gpt-4o-mini` with `response_format: json_object`, fallback to regex). The system prompt is `ISLA.searchSystemPrompt` from `lib/persona.ts`.
4. **Phase 1 mode** (no `LARAVEL_API_BASE_URL`): Parsed `SearchFilters` are run through `searchProperties()` — a scoring pass over the static array, returning ranked `{ property, score, explanation }`. The API returns at most 8 results. **Phase 2 mode** (`LARAVEL_API_BASE_URL` + `ABODE_API_TOKEN` set): filters are forwarded to `POST {LARAVEL_BASE}/api/search`; the returned results are passed to `generateExplanations()` (a second `gpt-4o-mini` call that writes one sentence per property) before responding. Falls back to Phase 1 dataset on any Laravel error.
5. Results render via `components/PropertyCard.tsx`. The single property page `app/property/[id]/page.tsx` fetches `/api/property/[id]`, which looks the ID up in the in-memory array (Phase 1) or forwards to `GET {LARAVEL_BASE}/api/property/{id}` (Phase 2).
6. `app/api/enquiries/route.ts` — `POST /api/enquiries` proxies enquiry form submissions to `POST {LARAVEL_BASE}/api/enquiries`. Returns `503` if Laravel env vars are absent.
7. `app/api/health/route.ts` — `GET /api/health` checks env var presence and pings `{LARAVEL_BASE}/api/health`. Useful for diagnosing Phase 2 connectivity; returns `{ ok, checks }` with HTTP 200/503.

`next.config.mjs` whitelists `www.newhomesforsale.co.uk` as a remote image hostname. Add any new external image sources there.

`lib/persona.ts` exports `ISLA` — the `searchSystemPrompt` (used by `parseIntent`) and `voiceSystemPrompt` (used by `/api/voice/session`). Edit here to change Isla's behaviour across both paths.

`lib/properties.ts` is the **single source of truth** for the 11-property demo dataset. IDs are the original scraper IDs (`26129`, `29137`, …) and match the image directories under `public/images/{id}/`. Keep those IDs stable — Phase 2 reuses them as the MariaDB primary key.

### Voice search

`components/VoiceSearch.tsx` uses **OpenAI Realtime WebRTC** — it is loaded with `next/dynamic({ ssr: false })` from both the home and results pages because it touches `window`. The flow:

1. Browser POSTs to `/api/voice/session` (server-side), which mints a short-lived ephemeral token from `POST https://api.openai.com/v1/realtime/client_secrets` — `OPENAI_API_KEY` never leaves the server.
2. Browser opens an `RTCPeerConnection`, adds the mic track, creates a data channel `"oai-events"`, and performs an SDP offer/answer handshake directly with `https://api.openai.com/v1/realtime/calls` using the ephemeral token.
3. On `session.created`, the client sends a `session.update` configuring `gpt-4o-mini-transcribe` for input transcription.
4. When the user stops speaking (`input_audio_buffer.speech_stopped`), status switches to `"processing"`. On `conversation.item.input_audio_transcription_completed`, the transcript is passed to `onTranscript()` and the WebRTC session tears down.

`/api/voice/session` returns `503` if `OPENAI_API_KEY` is absent. If the key is missing, the mic button still renders but shows an error on tap. The Isla voice prompt lives in `lib/persona.ts` (`ISLA.voiceSystemPrompt`).

### Scoring (`searchProperties`)

Each property starts at 100 and is adjusted by hard-coded weights for bedroom match, price band, and proximity to `near` POIs (`school` / `station` / `park`). Properties scoring < 50 are dropped. The Phase 2 spec moves this to a SQL ranking query (`ST_Distance_Sphere` + weighted score) — when tweaking weights here, mirror the change in the Phase 2 SQL sketch so behaviour doesn't diverge.

## Brand system (non-negotiable for UI work)

The visual system is editorial / architectural luxury, codified in `abode_brand_spec.md`. Tailwind tokens in `tailwind.config.ts` mirror it:

- **Colours:** `brand-charcoal` `#1B2B2B`, `brand-gold` `#C8A066`, `brand-gold-light` `#D4B07A` (hover states), `brand-ivory` `#F6F3EF`, `brand-stone` `#E7E1D9`, `brand-grey` `#6B6B6B`. Also exposed as CSS vars (`--abode-gold`, etc.) in `app/globals.css`. Use these canonical names only — the former legacy aliases (`brand-dark`, `brand-navy`, `brand-cream`, `brand-muted`) have been removed.
- **Type:** `font-display` = Cormorant Garamond (headlines, italics for the gold accent words like *perfect*), `font-sans` = Montserrat (UI, eyebrows, all caps with wide tracking). Both load via `next/font/google` in `app/layout.tsx` as CSS variables `--font-cormorant` / `--font-montserrat`.
- **Utilities in `globals.css`:** `.eyebrow` (10px uppercase, 0.3em tracking), `.hairline` / `.hairline-dark` / `.hairline-gold` (1px rules), `.grain` (SVG-noise overlay on dark surfaces), `.gold-underline` (animated hover), `.rise-in` (staggered entrance — use `animationDelay` for sequencing), `.shimmer-bg` (skeleton loading pulse), `.glass` / `.glass-light` (frosted-glass panel), `.vertical-rule` (rotated masthead label), `.scrollbar-none` (hide scrollbar on chip rails), `.text-gradient` (ivory-to-gold gradient text).
- **Tailwind animations:** `animate-fade-in`, `animate-slide-up` (both 0.9 s, used for page elements), `animate-shimmer` (loading skeletons — prefer `.shimmer-bg` utility instead), `animate-ken-burns` (hero image slow-zoom), `animate-pulse-ring` (voice recording indicator). Stagger cards with inline `animationDelay` and `animationFillMode: "both"`.
- **Letter-spacing tokens:** `tracking-editorial` (0.32em), `tracking-wordmark` (0.4em).
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
- `abode_laravel_plan.md` — step-by-step migration plan for the separate `ABODE-laravel` repo (Cloudways/PHP deployment); explains route/component mapping and build phases.
- `abode_brand_spec.md` — brand system source of truth.
- `ABODE Brand Design V1 May 2026.pdf` — visual reference.
