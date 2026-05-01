# Architecture

## Overview

PWA Probe is a **client-side-first** application. The detection engine runs entirely in the user's browser — no API calls, no server processing — making it fast, privacy-respecting, and deployable as a static site if needed. The server layer exists only for optional features: persisting scan results, user accounts, and shareable report URLs.

```
Browser (client)
  └── Detection Engine          ← pure TypeScript, zero UI dependencies
        ├── CHECK_REGISTRY      ← 80 ApiCheck definitions across 14 categories
        ├── runner.ts           ← orchestrates 3-stage scan
        ├── scorer.ts           ← weighted score + tier calculation
        ├── advisor.ts          ← rule-based advisory generation
        └── fingerprint.ts      ← device + browser context

Next.js App Router (server + client)
  ├── /scan page               ← runs engine client-side, streams results live
  ├── /r/[token] page          ← shareable read-only report
  └── /dashboard page          ← authenticated user history

Supabase (BaaS)
  ├── Auth                     ← anonymous + OAuth sign-in
  └── Postgres (via Drizzle)   ← scan_records, users tables
```

---

## Module boundaries

### `src/engine/` — Detection engine

**Rules:**

- Zero UI imports. No React, no Next.js. Pure TypeScript.
- No network calls. Every check runs synchronously or with browser API promises only.
- Fully unit-testable in jsdom (Vitest).

**Files:**

| File              | Responsibility                                                                         |
| ----------------- | -------------------------------------------------------------------------------------- |
| `types.ts`        | All shared types (`ApiCheck`, `CheckResult`, `ScanRecord`, etc.)                       |
| `checks/`         | 14 files, one per category. Each exports an `ApiCheck[]` array.                        |
| `checks/index.ts` | `CHECK_REGISTRY` — flat array of all 80 checks                                         |
| `runner.ts`       | `runScan()` — executes checks in 3 stages, calls `onCheckComplete` callback per result |
| `scorer.ts`       | `calculateScore()`, `calculateTier()`, `calculateCategoryScores()`                     |
| `advisor.ts`      | `generateAdvisories()` — matches results against 11 advisory rules                     |
| `fingerprint.ts`  | `detectDevice()`, `detectBrowser()` — produces `DeviceContext` + `BrowserContext`      |

### `src/app/` — Next.js pages

App Router. All pages are server components by default; `'use client'` is added only where the engine or browser APIs are used.

### `src/components/` — UI components

Presentational only. No data fetching. Receive typed props from pages.

### `src/lib/` — Shared utilities

- `supabase/` — browser + server Supabase clients (using `@supabase/ssr`)
- `utils.ts` — `cn()` helper (clsx + tailwind-merge)

---

## Data flow — scan lifecycle

```
User opens /scan
  │
  ├─ fingerprint.ts          → DeviceContext, BrowserContext
  │
  ├─ runner.ts: Stage 1      → all stage-1 checks in parallel (Promise.all)
  │   └── onCheckComplete()  → UI updates live as each result arrives
  │
  ├─ runner.ts: Stage 2      → stage-2 checks in sequence (one permission dialog at a time)
  │   └── onCheckComplete()
  │
  ├─ runner.ts: Stage 3      → only if window.matchMedia('(display-mode: standalone)')
  │   └── onCheckComplete()
  │
  ├─ scorer.ts               → score (0–100), tier, category scores
  ├─ advisor.ts              → advisory array
  │
  └─ [optional] Supabase     → persist ScanRecord, get share_token
                               → redirect to /r/[share_token]
```

---

## Scan stages

| Stage | Trigger                                    | Execution  | Checks                                                                              |
| ----- | ------------------------------------------ | ---------- | ----------------------------------------------------------------------------------- |
| 1     | Always                                     | Parallel   | APIs that don't need permissions (HTTPS, manifest, storage, etc.)                   |
| 2     | Always                                     | Sequential | APIs that may trigger permission dialogs (camera, notifications, geolocation, etc.) |
| 3     | Only if app is installed (standalone mode) | Parallel   | APIs only available after install (app badging, launch handler, etc.)               |

Sequential execution in Stage 2 avoids multiple simultaneous permission dialogs, which browsers may suppress.

---

## Scoring model

Each `ApiCheck` has a `weight` (1–5). Status values map to scores:

| Status              | Score multiplier          |
| ------------------- | ------------------------- |
| `supported`         | 1.0                       |
| `partial`           | 0.5                       |
| `permission_denied` | 0.3                       |
| `https_required`    | 0.1                       |
| `not_supported`     | 0.0                       |
| `not_tested`        | excluded from denominator |

Final score: `Σ(weight × status_score) / Σ(weight) × 100`, rounded to integer.

---

## Database schema (planned)

> Schema not yet created. Migrations will live in `drizzle/migrations/`.

```
scan_records
  id            uuid PK
  user_id       uuid FK → auth.users (nullable — anonymous scans allowed)
  share_token   text UNIQUE  (used in /r/[token] URLs)
  scanned_at    timestamptz
  score         int
  tier          text
  stage_reached int
  device        jsonb
  browser       jsonb
  checks        jsonb
  category_scores jsonb
  advisories    jsonb
```

---

## Environment split

| File               | Purpose                            | Gitignored |
| ------------------ | ---------------------------------- | ---------- |
| `.env`             | Local dev secrets                  | ✅         |
| `.env.development` | Dev-only vars (e.g. localhost URL) | ✅         |
| `.env.production`  | Prod-only vars (e.g. vercel URL)   | ✅         |
| `.env.example`     | Documented template, no secrets    | ❌ tracked |

Next.js loads these in order. `.env.local` overrides everything (not used here).

---

## Key design decisions

**Why client-side engine?**  
Browser API availability is inherently per-browser. A server can't know if your specific Chrome on Android 14 supports Web Bluetooth. The check must run in the actual browser being tested.

**Why 3 stages?**  
Permission dialogs are user-hostile if shown all at once. Stage 2 serializes them. Stage 3 avoids testing install-only APIs on non-installed browsers (they'd all fail, not because the browser lacks support but because the context is wrong).

**Why Drizzle over Supabase client for DB?**  
Supabase JS client is used for auth and real-time. Drizzle gives type-safe migrations and raw SQL control for complex queries on `scan_records`.

**Why pnpm?**  
Strict dependency isolation, fast installs, and workspace support if we ever split into packages.
