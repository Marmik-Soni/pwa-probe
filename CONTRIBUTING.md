# Contributing to PWA Probe

Thanks for your interest in contributing. This is the quick-start. For the full guide (adding checks, writing tests, DB migrations, etc.) see [docs/contributing.md](docs/contributing.md).

---

## Before you start

- Read [docs/architecture.md](docs/architecture.md) to understand the system
- Check [open issues](https://github.com/Marmik-Soni/pwa-probe/issues) — your idea might already be tracked

---

## Setup

```bash
git clone https://github.com/Marmik-Soni/pwa-probe.git
cd pwa-probe
pnpm install
cp .env.example .env   # fill in Supabase values
pnpm dev
```

---

## Branch naming

| Type            | Pattern                 | Example                           |
| --------------- | ----------------------- | --------------------------------- |
| New feature     | `feature/<description>` | `feature/score-ring-component`    |
| Bug fix         | `fix/<description>`     | `fix/safari-service-worker-check` |
| Chore / tooling | `chore/<description>`   | `chore/update-playwright`         |
| Docs            | `docs/<description>`    | `docs/add-engine-guide`           |

All branches CI on push. Only `main` requires a PR.

---

## Commit format

[Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Web Bluetooth check
fix: handle missing permissions API in Firefox
chore: upgrade Playwright to 1.52
docs: document advisory rule system
test: add unit tests for storage checks
refactor: extract makeResult helper
```

---

## Before opening a PR

Run the full local CI check:

```bash
pnpm typecheck && pnpm format:check && pnpm lint && pnpm test
```

All four must pass. The pre-commit hook catches most issues automatically, but it's good to verify the full suite before pushing.

---

## Pull request checklist

- [ ] Branch targets `main`
- [ ] Title follows conventional commits format
- [ ] New checks have unit tests
- [ ] No new TypeScript errors (`pnpm typecheck`)
- [ ] No new lint warnings (`pnpm lint`)
- [ ] `.env.example` updated if new env vars were added

---

## What to contribute

- **New capability checks** — see [docs/engine.md](docs/engine.md) for the full guide
- **Bug fixes** — browser-specific detection edge cases are common
- **UI components** — `src/components/` (presentational, no data fetching)
- **E2E tests** — `src/tests/e2e/` using Playwright
- **Documentation** — always welcome

---

## Code of conduct

Be respectful. This is a small open project — keep discussions focused on the work.
