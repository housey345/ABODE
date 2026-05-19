# ABODE Phase 1 Build Specification (for Claude Code)

## Project Goal

Build **Phase 1 MVP demo** of **ABODE**: an AI-powered property discovery platform for **new-build homes in Edinburgh**.

The core differentiator is **natural language + voice search** for property discovery.

Example query:

> “I want a 3-bedroom family home near a good school in Edinburgh under £500,000.”

The system should interpret this, run geo-aware structured search, and return ranked property cards with AI explanations.

---

# Existing Stack

Backend:

- Laravel (existing)
- MariaDB / MySQL
- Cloudways hosting (no root access)

Frontend:

- Replace current frontend with Next.js mobile-first UI

Infra constraints:

- Must work without root/server-level package installs
- Prefer API-first deployment
- Avoid requiring VPS unless absolutely necessary

---

# Architecture

## Frontend

Use:

- Next.js (App Router)
- TailwindCSS
- Mobile-first design
- Voice-first interface
- Chat-like search experience

Pages:

### Home

Large microphone CTA:

“Tell ABODE what you’re looking for”

Supports:

- voice input
- typed natural language

---

### Search Results

Show:

- conversational summary
- ranked property cards
- “Why this matches” explanation

Each property card:

- hero image
- development name
- price
- beds
- area
- distance badges:
  - nearest school
  - nearest station
  - nearest park

---

### Property Detail Page

Show:

- gallery
- AI summary
- local amenities
- map
- enquiry CTA

---

## Backend (Laravel)

Create API endpoints:

### POST /api/search

Input:

```json
{
  "query": "3 bed near schools in Edinburgh under 500k"
}
```

Returns parsed intent + results

---

### POST /api/parse-intent

Uses OpenAI to extract structured filters

Example output:

```json
{
  "location": "Edinburgh",
  "beds": 3,
  "max_price": 500000,
  "near": ["school"],
  "property_type": "house"
}
```

---

### GET /api/property/{id}

Returns full property detail

---

# AI Layer

Use OpenAI API.

Tasks:

## Intent Extraction

Convert natural language into structured search filters.

Must support:

- bedrooms
- price
- area
- “near school”
- “near station”
- “family-friendly”
- “commuter-friendly”

---

## Result Explanation

Generate natural language rationale:

“This property is ideal because it is within walking distance of schools and 14 minutes from central Edinburgh.”

---

# Voice Layer

Use OpenAI Realtime API.

Requirements:

- microphone activation
- speech-to-text
- send transcript to search API
- render streamed response

Fallback:

typed search input

---

# Geospatial Search

Database includes:

Properties:

- id
- name
- lat
- lng
- POINT location
- price
- bedrooms
- type

POIs:

- schools
- train stations
- tram stops
- parks
- supermarkets

Source:

OpenStreetMap Overpass API

Store locally.

---

# Distance Calculations

Precompute:

- nearest_school_distance
- nearest_station_distance
- nearest_park_distance
- nearest_supermarket_distance

Use MySQL spatial functions.

---

# Ranking Logic

Rank by weighted score:

- relevance to parsed filters
- school proximity
- station proximity
- value score
- freshness

Return top matches only.

---

# Demo UX Priority

The demo should feel premium and polished.

Critical “wow moment”:

User taps mic and says:

“Find me a 3 bed family home near schools in Edinburgh”

System:

1. Transcribes speech
2. Shows “Searching…”
3. Returns relevant homes
4. Explains why they match

Must feel fast (<3 sec perceived latency)

---

# Design Style

Premium modern property-tech aesthetic.

Reference:

- Apple
- Rightmove (cleaner)
- Stripe polish

Characteristics:

- large typography
- whitespace
- glassmorphism accents
- subtle animation
- dark/light support

---

# Deliverables

Build:

- working Next.js frontend
- Laravel API integration
- OpenAI intent parsing
- voice search flow
- geo search filters
- mobile-optimised UI
- deployable demo

Goal:

A polished mobile demo suitable to pitch to UK property developers and investors.
