# PWA Probe

**Browser Capability Scanner** — Run ~80 real API checks against your browser and get a scored, shareable PWA readiness report.

Live at **[pwa-probe.vercel.app](https://pwa-probe.vercel.app)**

---

## What it does

PWA Probe runs directly in your browser with no server involvement. It probes ~80 Web APIs across 14 capability categories, scores each one, and produces a tiered report showing exactly what your browser-device combination can and cannot do as a PWA.

| Score | Tier                                            |
| ----- | ----------------------------------------------- |
| ≥ 90  | **PWA Native** — full native parity             |
| ≥ 70  | **PWA Ready** — installable, offline-capable    |
| ≥ 50  | **PWA Capable** — solid foundation, gaps remain |
| < 50  | **Web Only** — critical PWA features missing    |

---

## Tech stack

| Layer           | Choice                                             |
| --------------- | -------------------------------------------------- |
| Framework       | Next.js 16 (App Router, React Compiler)            |
| Language        | TypeScript 5 (strict + `noUncheckedIndexedAccess`) |
| Styling         | Tailwind CSS v4 + shadcn/ui                        |
| Database        | Supabase (Postgres) + Drizzle ORM                  |
| Auth            | Supabase Auth                                      |
| Tests           | Vitest (unit) + Playwright (E2E)                   |
| CI/CD           | GitHub Actions → Vercel                            |
| Package manager | pnpm 9                                             |

---

## Project structure

```
pwa-probe/
├── src/
│   ├── app/              # Next.js App Router pages + layouts
│   ├── components/       # UI components (ScoreRing, CheckCard, …)
│   ├── engine/           # Core detection engine (zero UI, browser-only)
│   │   ├── types.ts      # All shared TypeScript types
│   │   ├── checks/       # 14 category check files + registry
│   │   ├── runner.ts     # 3-stage scan orchestrator
│   │   ├── scorer.ts     # Weighted score + tier calculation
│   │   ├── advisor.ts    # Advisory rule engine
│   │   └── fingerprint.ts# Device + browser context detection
│   ├── lib/              # Shared utilities (supabase client, cn, …)
│   └── tests/
│       ├── unit/         # Vitest unit tests (engine)
│       └── e2e/          # Playwright E2E tests
├── docs/                 # Extended documentation (see below)
├── .github/workflows/    # CI/CD pipeline
├── .env.example          # Documents all required env vars
└── public/               # Static assets + PWA icons
```

---

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 9 — `npm install -g pnpm`
- A Supabase project (for auth + storage of scan results)

### 1. Clone and install

```bash
git clone https://github.com/Marmik-Soni/pwa-probe.git
cd pwa-probe
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values. At minimum you need:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

See [`.env.example`](.env.example) for the full list and explanations.

### 3. Run dev server

```bash
pnpm dev
# → http://localhost:3000
```

---

## Available scripts

| Command              | What it does                                 |
| -------------------- | -------------------------------------------- |
| `pnpm dev`           | Start Next.js dev server                     |
| `pnpm build`         | Production build                             |
| `pnpm start`         | Serve production build locally               |
| `pnpm typecheck`     | TypeScript strict check (no emit)            |
| `pnpm lint`          | ESLint                                       |
| `pnpm lint:fix`      | ESLint with auto-fix                         |
| `pnpm format`        | Prettier — write                             |
| `pnpm format:check`  | Prettier — check only (used in CI)           |
| `pnpm test`          | Vitest unit tests (single run)               |
| `pnpm test:watch`    | Vitest in watch mode                         |
| `pnpm test:coverage` | Vitest with v8 coverage report               |
| `pnpm test:e2e`      | Playwright E2E tests                         |
| `pnpm db:generate`   | Drizzle — generate migration files           |
| `pnpm db:migrate`    | Drizzle — run pending migrations             |
| `pnpm db:push`       | Drizzle — push schema without migration file |

---

## Documentation

| Doc                                          | What's inside                                            |
| -------------------------------------------- | -------------------------------------------------------- |
| [docs/architecture.md](docs/architecture.md) | System design, data flow, module boundaries              |
| [docs/engine.md](docs/engine.md)             | Detection engine deep-dive — checks, scoring, advisories |
| [docs/ci-cd.md](docs/ci-cd.md)               | Full CI/CD pipeline explanation + secrets reference      |
| [docs/contributing.md](docs/contributing.md) | How to add checks, contribute code, run tests locally    |
| [CONTRIBUTING.md](CONTRIBUTING.md)           | Contributor quick-start (branch rules, commit format)    |
| [SECURITY.md](SECURITY.md)                   | Security policy + responsible disclosure                 |

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) first, then [docs/contributing.md](docs/contributing.md) for the detailed guide.

---

## License

MIT — see [LICENSE](LICENSE).
