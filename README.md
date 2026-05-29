# ABODE

AI-powered property search with an editorial luxury aesthetic. Users describe what they're looking for in natural language and **Isla** — ABODE's AI assistant — finds matching homes from the dataset.

## Tech stack

- **Next.js 15** (App Router) — TypeScript, Tailwind CSS
- **OpenAI** `gpt-4o-mini` — intent parsing and result explanations
- **OpenAI Realtime (WebRTC)** — voice search; the browser opens a peer connection using a short-lived ephemeral token minted by `/api/voice/session` (`OPENAI_API_KEY` never leaves the server)
- **Laravel + MariaDB** (Phase 2) — backend API and property database

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

### Environment variables

Create a `.env.local` file. All variables are server-side only.

| Variable | Purpose | Required |
|---|---|---|
| `OPENAI_API_KEY` | Intent parsing + explanation generation | No — falls back to regex |
| `LARAVEL_API_BASE_URL` | Laravel backend base URL | No — uses in-memory dataset |
| `ABODE_API_TOKEN` | Bearer token for Next.js → Laravel calls | Required when `LARAVEL_API_BASE_URL` is set |

Without any env vars the app runs in demo mode using the 11-property in-memory dataset.

## Commands

```bash
npm run dev       # development server
npm run build     # production build
npm run start     # serve the built app
npm run lint      # ESLint
```

## Architecture

```
app/
  page.tsx                  # Home — search input, hero
  results/page.tsx          # Results page
  property/[id]/page.tsx    # Single property view
  api/
    search/route.ts         # POST /api/search — intent parse + property lookup
    property/[id]/route.ts  # GET  /api/property/:id
    enquiries/route.ts      # POST /api/enquiries — proxies to Laravel (Phase 2)
    voice/session/route.ts  # POST /api/voice/session — mints OpenAI Realtime ephemeral token
    health/route.ts         # GET  /api/health — env + Laravel connectivity check

components/
  PropertyCard.tsx          # Search result card
  VoiceSearch.tsx           # OpenAI Realtime WebRTC voice client (client-only)

lib/
  openai.ts                 # parseIntent() + generateExplanations()
  properties.ts             # In-memory dataset (11 properties, Phase 1) + scoring
  persona.ts                # Isla's search + voice system prompts
  rate-limit.ts             # In-memory rate limiting + same-origin guard for API routes
```

**Phase 1** (current): single-process Next.js with an in-memory dataset.  
**Phase 2**: same Next.js shell, Laravel + MariaDB backend, OpenAI Realtime WebRTC voice via `/api/voice/session`.

## Brand

The visual system is editorial / architectural luxury. Key tokens:

- **Colours:** `brand-charcoal` `#1B2B2B` · `brand-gold` `#C8A066` · `brand-ivory` `#F6F3EF`
- **Type:** Cormorant Garamond (display) · Montserrat (UI)
- **Rules:** square corners, large whitespace, thin dividers, no rounded consumer-tech UI

Full brand spec: [`abode_brand_spec.md`](abode_brand_spec.md)

## Docs

| File | Purpose |
|---|---|
| `CLAUDE.md` | Instructions for AI-assisted development |
| `abode_brand_spec.md` | Brand system source of truth |
| `abode_phase2_spec.md` | Spec for Laravel/Realtime migration |
| `abode_laravel_plan.md` | Step-by-step migration plan |
