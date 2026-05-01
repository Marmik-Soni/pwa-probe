# CI/CD Pipeline

## Overview

Every code change to `main` flows through a 4-stage GitHub Actions pipeline before reaching production. No direct pushes to `main` are allowed — all changes must go through a pull request.

```
PR opened / push to feature branch
  │
  ├── Stage 1 (parallel)
  │     ├── Type check   (tsc --noEmit)
  │     ├── Lint + format (Prettier + ESLint)
  │     └── Unit tests   (Vitest + coverage)
  │
  ├── Stage 2 (needs Stage 1)
  │     └── Next.js build
  │
  ├── Stage 3 (needs Stage 2)
  │     ├── E2E — Chromium        ← BLOCKING (required for merge + deploy)
  │     └── E2E — Firefox/WebKit  ← informational only (continue-on-error)
  │
  └── Stage 4 (main push only, needs Chromium E2E)
        └── Deploy to production  ← Vercel via CLI
              └── DB migrations   ← Drizzle (after deploy)
```

**Workflow file:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

---

## Branch rules

| Branch pattern | Triggers CI | Can be pushed directly |
| -------------- | ----------- | ---------------------- |
| `main`         | ✅          | ❌ — PR required       |
| `feature/**`   | ✅          | ✅                     |
| `fix/**`       | ✅          | ✅                     |
| `chore/**`     | ✅          | ✅                     |

Branch protection on `main` requires all 5 checks to pass before a PR can merge:

1. `Type check`
2. `Lint + format`
3. `Unit tests (Vitest)`
4. `Next.js build`
5. `E2E — Chromium`

---

## Stage 1 — Quality gates

All three jobs run in parallel on `ubuntu-latest`.

### Type check

```bash
pnpm typecheck   # tsc --noEmit (strict mode)
```

Fails on any TypeScript error, including `noUncheckedIndexedAccess` violations.

### Lint + format

```bash
pnpm format:check          # Prettier — no writes, just validates
pnpm exec eslint . --max-warnings 0   # ESLint — zero warnings allowed
```

Note: `pnpm exec eslint` is used instead of `pnpm lint` to avoid pnpm's argument passthrough stripping `--max-warnings`.

### Unit tests

```bash
pnpm test:coverage   # vitest run --coverage
```

Uploads coverage report as a 14-day artifact (`coverage-report`).

---

## Stage 2 — Build

```bash
pnpm build
```

Uses a cache keyed on `pnpm-lock.yaml` + all `.ts`/`.tsx` files to skip unchanged builds.

The `.next/` output is uploaded as a 1-day artifact (`nextjs-build`) for the E2E stage to consume — avoiding a second build.

Build-time env vars injected from GitHub Secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`

---

## Stage 3 — E2E tests

### E2E — Chromium (blocking)

Downloads the `nextjs-build` artifact and starts the app with `pnpm start`, then runs Playwright against Chromium.

```bash
pnpm exec playwright test --project=chromium --pass-with-no-tests
```

`--pass-with-no-tests` is present because no E2E tests are written yet. **Remove this flag once the first E2E test exists.**

Uses a **staging Supabase project** (separate from production) to avoid test data polluting the real database. Secrets: `CI_SUPABASE_URL`, `CI_SUPABASE_PUBLISHABLE_KEY`, `CI_SUPABASE_SERVICE_ROLE_KEY`.

Playwright report is uploaded on failure only (`playwright-report-chromium`, 7 days).

### E2E — Firefox / WebKit (informational)

Same as Chromium but runs as a matrix (`[firefox, webkit]`) with `continue-on-error: true`. These failures are visible but **do not block** the PR merge or deploy.

Only runs on:

- Push to `main`
- Manual trigger (`workflow_dispatch`)
- Weekly schedule (Monday 03:00 UTC)

---

## Stage 4 — Deploy to production

Only runs when:

- Branch is `main`
- Trigger is a `push` (not PR, not schedule, not manual)

Runs in the `production` GitHub environment, which gates access to production secrets.

### Steps

1. **Install Vercel CLI** via pnpm global install
2. **Pull Vercel environment** — syncs `.vercel/` project config + production env vars from Vercel
3. **Build for Vercel** — `vercel build --prod` (uses Vercel's build system, not `pnpm build`)
4. **Deploy** — `vercel deploy --prebuilt --prod`, outputs the deployment URL
5. **Run DB migrations** — `pnpm db:migrate` (currently `continue-on-error: true` until schema exists — remove once migrations are added)
6. **Output URL** — echoes the deployment URL to the Actions log

### Important: disable Vercel auto-deploy

Vercel's Git integration will trigger its own deploy on every push in addition to the Actions deploy. To prevent double deployments:

Go to **Vercel → Project Settings → Git → Ignored Build Step** and enter:

```bash
echo "Skipped: deployed via GitHub Actions"
exit 0
```

Or disconnect the Git integration entirely.

---

## Secrets reference

### Repository-level secrets

Go to: `github.com/Marmik-Soni/pwa-probe/settings/secrets/actions`

| Secret                                 | Used in     | Purpose                                        |
| -------------------------------------- | ----------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Build       | Production Supabase project URL                |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Build       | Production publishable key                     |
| `NEXT_PUBLIC_APP_URL`                  | Build + E2E | `https://pwa-probe.vercel.app`                 |
| `CI_SUPABASE_URL`                      | E2E         | Staging Supabase project URL                   |
| `CI_SUPABASE_PUBLISHABLE_KEY`          | E2E         | Staging publishable key                        |
| `CI_SUPABASE_SERVICE_ROLE_KEY`         | E2E         | Staging service role key (for test data setup) |

### `production` environment secrets

Go to: `github.com/Marmik-Soni/pwa-probe/settings/environments/production`

| Secret                      | Used in       | Purpose                                      |
| --------------------------- | ------------- | -------------------------------------------- |
| `VERCEL_TOKEN`              | Deploy        | Vercel personal access token                 |
| `VERCEL_ORG_ID`             | Deploy        | Vercel team/account ID (`team_...`)          |
| `VERCEL_PROJECT_ID`         | Deploy        | Vercel project ID (`prj_...`)                |
| `DATABASE_URL`              | DB migrations | Direct Postgres connection string (Supabase) |
| `SUPABASE_SERVICE_ROLE_KEY` | DB migrations | Production service role key                  |

---

## Concurrency

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
```

- On feature/fix branches: a new push cancels the previous in-progress run (saves CI minutes)
- On `main`: runs are never cancelled (ensures deploy always completes)

---

## Weekly smoke test

The `schedule` trigger runs the full pipeline (through E2E, skipping deploy) every Monday at 03:00 UTC. This catches API regressions even if no code was pushed.

---

## Adding a new secret

1. Add to the appropriate location (repo-level or `production` environment) via the GitHub UI or:
   ```bash
   gh secret set SECRET_NAME --repo Marmik-Soni/pwa-probe
   # or for environment secrets:
   gh secret set SECRET_NAME --repo Marmik-Soni/pwa-probe --env production
   ```
2. Reference it in `.github/workflows/ci.yml` as `${{ secrets.SECRET_NAME }}`
3. Document it in the table above

---

## Troubleshooting

### "required status checks are expected" on PR merge

Branch protection check names must exactly match the job `name:` field in the workflow (no workflow prefix). Current required names:

- `Type check`
- `Lint + format`
- `Unit tests (Vitest)`
- `Next.js build`
- `E2E — Chromium`

To update via CLI:

```bash
gh api --method PUT repos/Marmik-Soni/pwa-probe/branches/main/protection \
  --field 'required_status_checks[strict]=false' \
  --field 'required_status_checks[contexts][]=Type check' \
  --field 'required_status_checks[contexts][]=Lint + format' \
  --field 'required_status_checks[contexts][]=Unit tests (Vitest)' \
  --field 'required_status_checks[contexts][]=Next.js build' \
  --field 'required_status_checks[contexts][]=E2E — Chromium' \
  --field 'enforce_admins=true' \
  --field 'required_pull_request_reviews[required_approving_review_count]=0' \
  --field 'restrictions=null'
```

### "pnpm store path" errors in CI

`pnpm-workspace.yaml` must have a `packages` field even for single-package repos:

```yaml
packages:
  - '.'
```

### E2E "No tests found" exits with code 1

Use `--pass-with-no-tests` until the first E2E test is written.
