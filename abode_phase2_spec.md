# ABODE Phase 2 Build Specification (for Claude Code)

## Project Goal

Promote ABODE from the **Phase 1 static demo** to a **real backend-driven product** by replacing the in-memory TypeScript dataset with a **Laravel + MariaDB** API, expanding the POI dataset via OpenStreetMap, and moving search/ranking into SQL.

Phase 1 (Next.js + `lib/properties.ts` + `app/api/*` route handlers) keeps working throughout — Phase 2 swaps the data source under it without changing the user-visible search/results/detail flow.

---

## Phase 1 → Phase 2 Delta

| Concern | Phase 1 (today) | Phase 2 |
|---|---|---|
| Data store | `lib/properties.ts` (11 static records) | MariaDB on Cloudways |
| Property API | Next.js `app/api/search`, `app/api/property/[id]` (own logic) | Next.js routes proxy to Laravel `/api/search`, `/api/property/{id}` |
| Intent parsing | `lib/openai.ts` called from Next.js route | **Stays in Next.js** — `lib/openai.ts` retained, OpenAI never called from Laravel |
| Result explanations | None | New — generated in Next.js after Laravel returns results |
| Voice input | Web Speech API in the browser | **OpenAI Realtime API** session brokered by Next.js |
| Auth | None | Shared API token (Next.js ↔ Laravel) + CSRF/captcha on `enquiries` |
| POI data | One pre-computed nearest school/station/park per property | Full POI tables (schools, stations, tram stops, parks, supermarkets) from OSM |
| Distance | Pre-computed numbers on each Property record | `ST_Distance_Sphere` over POINT columns at query time |
| Ranking | JS filter in `app/api/search/route.ts` | Weighted SQL score (relevance + proximity + value + freshness) |
| Images | `public/images/{id}/*.jpeg` in Next.js | Same paths, served by Next.js (no need to move) |
| Hosting | `npm run dev` locally | Laravel on Cloudways; Next.js wherever (Vercel or same box) |

---

## Architecture

```
[ Browser ]
    │   (Web fetch, WebRTC for voice)
    ▼
[ Next.js — frontend + thin API layer ]
    │
    ├─► OpenAI    (parse-intent, result explanations, Realtime voice broker)
    │
    └─► Laravel API on Cloudways   (Authorization: Bearer <ABODE_API_TOKEN>)
            │
            └─► MariaDB (properties, pois, enquiries)
```

Next.js keeps its `app/api/*` routes — they become **thin orchestrators**:

- call OpenAI for intent parsing (low latency, key never leaves the Next.js server)
- forward structured filters to Laravel for the SQL search
- call OpenAI again to generate "why this matches" sentences
- return the composed response to the browser

Laravel is **pure data + ranking**. It never talks to OpenAI. CORS is not a concern because the browser only ever talks to Next.js; Laravel is accessed server-to-server.

Env vars:
- `OPENAI_API_KEY` — Next.js only (already in `.env.local`)
- `LARAVEL_API_BASE_URL` — Next.js only (server-side, **not** `NEXT_PUBLIC_*`)
- `ABODE_API_TOKEN` — shared secret, set on both Next.js and Laravel

---

## Database Schema (MariaDB)

### `properties`
```sql
CREATE TABLE properties (
  id              INT UNSIGNED PRIMARY KEY,           -- reuse scraper IDs (26129, 29137, …)
  name            VARCHAR(255) NOT NULL,
  developer       VARCHAR(255) NOT NULL,
  price_raw       VARCHAR(255),
  price_min       INT UNSIGNED,
  price_max       INT UNSIGNED,
  bedrooms_text   VARCHAR(255),
  bedrooms_json   JSON,                                -- [2,3,4]
  locality        VARCHAR(128),
  region          VARCHAR(128),
  postal_code     VARCHAR(16),
  location        POINT NOT NULL SRID 4326,
  url             VARCHAR(512),
  images_json     JSON,                                -- ["/images/26129/001.jpeg", …]
  description     TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  SPATIAL INDEX (location)
);
```

### `pois`
```sql
CREATE TABLE pois (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  osm_id      BIGINT,
  type        ENUM('school','station','tram','park','supermarket') NOT NULL,
  name        VARCHAR(255),
  location    POINT NOT NULL SRID 4326,
  tags_json   JSON,
  SPATIAL INDEX (location),
  INDEX (type)
);
```

### `enquiries` (new — captures "Enquire" CTA submissions)
```sql
CREATE TABLE enquiries (
  id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  property_id  INT UNSIGNED NOT NULL,
  name         VARCHAR(255),
  email        VARCHAR(255),
  phone        VARCHAR(64),
  message      TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);
```

### `search_log` (optional — for analytics + caching)
```sql
CREATE TABLE search_log (
  id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  query        TEXT,
  parsed_json  JSON,
  result_ids   JSON,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Laravel API

Mount under `/api`. **Server-to-server only** — every request must carry `Authorization: Bearer $ABODE_API_TOKEN`; reject otherwise with 401. No CORS needed (browser never calls Laravel directly).

### `POST /api/search`
Body (filters only — no natural-language query, parsing happens upstream in Next.js):
```json
{
  "filters": {
    "beds": 3,
    "max_price": 500000,
    "min_price": null,
    "locality": "Edinburgh",
    "near": ["school", "station"]
  },
  "limit": 12
}
```
Pipeline:
1. Build SQL with `ST_Distance_Sphere(location, POINT(lng, lat))` joins against `pois`.
2. Apply filters (beds, max_price, min_price, locality).
3. Rank (see below).
4. Return `{ results: [{ property, distances: {school, station, park} }] }`. **No** OpenAI calls — explanations are added by Next.js.

### `GET /api/property/{id}`
Returns the full property + the 5 nearest POIs of each type.

### `POST /api/enquiries`
Body: `{ property_id, name, email, phone?, message?, captcha_token }`
Validates the captcha token (hCaptcha or Cloudflare Turnstile) server-side, then inserts into `enquiries`. Rate-limit by IP via Laravel's `throttle` middleware (e.g. 10/hour). Even though the API is token-gated, the token lives in the Next.js server — the captcha protects against a leaked-token replay.

## Next.js API Layer

`app/api/*` routes are retained and rewritten as orchestrators:

### `POST /api/search` (Next.js)
1. `parseIntent(query)` — `lib/openai.ts`, unchanged from Phase 1.
2. `fetch(LARAVEL_API_BASE_URL + '/api/search', { headers: { Authorization: 'Bearer ' + ABODE_API_TOKEN }, body: { filters, limit: 12 } })`.
3. `generateExplanations(results, parsed)` — single batched OpenAI call returning a `why` string per property.
4. Return `{ parsed, results: [{ property, distances, why }] }` to the browser. **Frontend pages don't change.**

### `GET /api/property/[id]` (Next.js)
Proxy to Laravel `/api/property/{id}` with the bearer token. No OpenAI on this path.

### `POST /api/enquiries` (Next.js)
Forwards to Laravel after attaching the captcha token from the form.

### `POST /api/voice/session` (Next.js — new, see Voice section)
Mints a short-lived OpenAI Realtime session token for the browser.

OpenAI intent-parse responses are cached in-process (or via Vercel KV / Upstash if hosted serverless) keyed by SHA256 of the normalised query, 24h TTL.

## Voice (OpenAI Realtime API)

Replaces Phase 1's Web Speech API for the mic-tap flow.

Flow:
1. User taps the mic on `app/page.tsx`.
2. Browser calls `POST /api/voice/session` — Next.js requests an ephemeral Realtime session token from OpenAI and returns it. The long-lived `OPENAI_API_KEY` stays on the server.
3. Browser opens a WebRTC peer connection to the Realtime endpoint using the ephemeral token.
4. As partial transcripts arrive, they're shown live in the UI.
5. On end-of-utterance, the final transcript is POSTed to `/api/search` (Next.js) which runs the same parse → Laravel → explain pipeline.
6. Optionally, the model speaks the conversational summary back ("Found 4 homes that match…").

Fallback: typed search input remains.

---

## Ranking SQL (sketch)

```sql
SELECT
  p.*,
  (SELECT MIN(ST_Distance_Sphere(p.location, s.location))
     FROM pois s WHERE s.type='school')   AS dist_school_m,
  (SELECT MIN(ST_Distance_Sphere(p.location, st.location))
     FROM pois st WHERE st.type='station') AS dist_station_m,
  (
    /* relevance weights */
    (CASE WHEN :beds IS NULL OR JSON_CONTAINS(p.bedrooms_json, CAST(:beds AS JSON)) THEN 40 ELSE 0 END)
    + (CASE WHEN :max_price IS NULL OR p.price_min <= :max_price THEN 20 ELSE 0 END)
    + (CASE WHEN :near_school THEN GREATEST(0, 20 - (dist_school_m/100)) ELSE 0 END)
    + (CASE WHEN :near_station THEN GREATEST(0, 20 - (dist_station_m/100)) ELSE 0 END)
  ) AS score
FROM properties p
WHERE (:locality IS NULL OR p.locality = :locality)
ORDER BY score DESC, p.price_min ASC
LIMIT 12;
```

(Eloquent or raw query — both fine. The weights are starting values; tune against the 11-property demo set.)

---

## OSM POI Ingestion

Laravel artisan command: `php artisan pois:sync --bbox=edinburgh`.

- Query Overpass API for `amenity=school`, `railway=station`, `railway=tram_stop`, `leisure=park`, `shop=supermarket` inside the Edinburgh bounding box.
- Upsert into `pois` keyed by `osm_id`.
- Run once at setup, then nightly via Cloudways cron.

---

## Migration from Phase 1

### Seed properties from existing data
Two equivalent sources — use the SQLite DB:

- `/mnt/c/dev/my-scraper/output/developments.db` (canonical, 11 rows)
- `/mnt/c/dev/ABODE/lib/properties.ts` (mirror)

Artisan command `php artisan properties:import --from=sqlite --path=/path/to/developments.db` reads the scraper DB and writes the Laravel `properties` table. Keep the same integer IDs so image paths (`/images/{id}/*.jpeg`) continue to work without renaming anything.

### Frontend cutover (no behaviour change)
1. Add `LARAVEL_API_BASE_URL` and `ABODE_API_TOKEN` to Next.js `.env.local` (server-side, no `NEXT_PUBLIC_` prefix).
2. Rewrite `app/api/search/route.ts` as the orchestrator described in *Next.js API Layer* — `lib/openai.ts` is retained, only the data-fetch step changes from "read `lib/properties.ts`" to "fetch Laravel".
3. Rewrite `app/api/property/[id]/route.ts` as a token-attaching proxy.
4. Add `app/api/enquiries/route.ts` and `app/api/voice/session/route.ts`.
5. Replace the Web Speech API hook in `app/page.tsx` with an OpenAI Realtime client (WebRTC).
6. Keep `lib/properties.ts` around as a typed contract reference, or delete once the Laravel response shape is locked.

Stage in this order so the Next.js UI is never broken: build Laravel against the static dataset first, swap the orchestrator routes to fetch from Laravel, then layer in Realtime voice.

---

## Deployment (Cloudways constraints)

- Laravel app deployed to existing Cloudways app slot.
- MariaDB on the same Cloudways stack.
- **No root, no system package installs** — everything must work with stock PHP 8.2+, Composer-only dependencies.
- Cron via Cloudways UI (Overpass sync, OpenAI cache prune).
- OpenAI key in Cloudways app env, not in repo.
- Next.js can stay on Vercel for the demo — set `NEXT_PUBLIC_API_BASE_URL` to the Cloudways host.

---

## Out of Scope (defer to Phase 3)

- End-user accounts / saved searches / favourites
- Property data ingestion from sources beyond the existing scraper
- Mortgage / affordability calculators
- Admin UI for editing properties
- Multi-region expansion beyond Edinburgh

---

## Deliverables

- Laravel app with `properties`, `pois`, `enquiries` tables + seed data
- 3 Laravel endpoints live (token-gated): `search`, `property/{id}`, `enquiries`
- Next.js orchestrator routes: `/api/search`, `/api/property/[id]`, `/api/enquiries`, `/api/voice/session`
- OpenAI Realtime voice flow on the home page (replaces Web Speech API)
- Overpass POI sync command + nightly cron
- Captcha-protected enquiry form persisting to MariaDB
- Deployed to Cloudways with the existing 11 properties searchable end-to-end
- Upgraded "wow moment" demo flow (Realtime voice → matched homes → spoken summary) backed by real SQL
