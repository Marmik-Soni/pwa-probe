# Contributing Guide

This is the detailed guide. For the quick-start (branch naming, commit format, PR process) see [CONTRIBUTING.md](../CONTRIBUTING.md) at the repo root.

---

## Local setup

```bash
git clone https://github.com/Marmik-Soni/pwa-probe.git
cd pwa-probe
pnpm install
cp .env.example .env
# fill in your Supabase values in .env
pnpm dev
```

All tools (ESLint, Prettier, TypeScript, Vitest, Playwright) are installed as dev dependencies — nothing global is required except Node 20+ and pnpm 9.

---

## Pre-commit hooks

[Husky](https://typicode.github.io/husky/) runs [lint-staged](https://github.com/lint-staged/lint-staged) on every commit:

| Files matched               | Actions                         |
| --------------------------- | ------------------------------- |
| `*.{ts,tsx,js,jsx,mjs,cjs}` | Prettier (write) → ESLint (fix) |
| `*.{json,css,md}`           | Prettier (write)                |

This means your staged files are always formatted and lint-clean before they hit the commit. If ESLint finds an error it can't auto-fix, the commit is blocked.

---

## Code style

- **TypeScript strict** everywhere. No `any`, no `as` casts unless absolutely unavoidable.
- `noUncheckedIndexedAccess: true` — always null-check array/object access.
- **Prettier** handles all formatting. Don't fight it.
- **ESLint** is zero-warnings. Suppressions (`// eslint-disable`) require a comment explaining why.
- React Compiler is enabled — avoid patterns that break memoization (mutation of props, non-stable callbacks).

---

## Running tests

```bash
# Unit tests (fast, runs in jsdom)
pnpm test

# Watch mode during development
pnpm test:watch

# With coverage report (written to ./coverage/)
pnpm test:coverage

# E2E tests (requires app to be running or pnpm start)
pnpm test:e2e

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format check
pnpm format:check
```

Run all CI checks locally before opening a PR:

```bash
pnpm typecheck && pnpm format:check && pnpm lint && pnpm test
```

---

## Adding a new capability check

This is the most common contribution. Follow these steps:

### 1. Choose a category

Look at `src/engine/checks/` — there is one file per category. If the API fits an existing category, add to that file. If it's a genuinely new category, create a new file and register it in `src/engine/checks/index.ts`.

### 2. Determine the stage

| Stage | Use when                                                         |
| ----- | ---------------------------------------------------------------- |
| 1     | API doesn't require a permission dialog; safe to run in parallel |
| 2     | API may trigger a browser permission dialog                      |
| 3     | API only makes sense when the app is installed (standalone mode) |

### 3. Set the weight

| Weight | Meaning                                                |
| ------ | ------------------------------------------------------ |
| 5      | Core PWA requirement (HTTPS, Service Worker, Manifest) |
| 4      | Important feature with wide support                    |
| 3      | Useful feature                                         |
| 2      | Nice-to-have                                           |
| 1      | Niche or experimental                                  |

### 4. Write the check

```typescript
{
  id: 'my-api',                      // kebab-case, must be unique across ALL checks
  name: 'My API Name',               // shown in UI
  category: 'windowing_ui',
  description: 'One-sentence description of what this API enables.',
  weight: 2,
  stage: 1,
  known_support: {
    blink: true,      // Chrome, Edge, Samsung, Opera
    webkit: false,    // Safari
    gecko: 'partial', // Firefox
  },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/...',
  async run() {
    const start = performance.now();
    // Detection logic here
    const available = 'myAPI' in window;
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      weight: this.weight,
      status: available ? 'supported' : 'not_supported',
      detail: available
        ? 'My API is supported.'
        : 'My API is not available in this browser.',
      duration_ms: Math.round(performance.now() - start),
      stage: this.stage,
      permission_state: null,
      mdn_url: this.mdn_url,
      known_support: this.known_support,
    };
  },
}
```

**For permission-gated APIs (Stage 2):**

```typescript
async run() {
  const start = performance.now();
  let permissionState: PermissionState | null = null;

  try {
    const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
    permissionState = result.state;
  } catch {
    // permissions.query not supported
  }

  if (permissionState === 'denied') {
    return { ...base, status: 'permission_denied', permission_state: permissionState };
  }

  const available = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
  return {
    ...base,
    status: available ? 'supported' : 'not_supported',
    permission_state: permissionState,
  };
},
```

### 5. Write a unit test

Create or add to `src/tests/unit/engine/checks/<category>.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { myChecks } from '@/engine/checks/my-category';

describe('My API check', () => {
  beforeEach(() => {
    // Reset globals between tests
    vi.restoreAllMocks();
  });

  it('returns supported when API is present', async () => {
    Object.defineProperty(window, 'myAPI', { value: {}, configurable: true });
    const check = myChecks.find((c) => c.id === 'my-api')!;
    const result = await check.run();
    expect(result.status).toBe('supported');
  });

  it('returns not_supported when API is absent', async () => {
    Object.defineProperty(window, 'myAPI', { value: undefined, configurable: true });
    const check = myChecks.find((c) => c.id === 'my-api')!;
    const result = await check.run();
    expect(result.status).toBe('not_supported');
  });
});
```

### 6. Register in the index

In `src/engine/checks/index.ts`, import and spread your new array into `CHECK_REGISTRY`.

---

## Adding an advisory rule

Advisory rules live in `src/engine/advisor.ts` in the `ADVISORY_RULES` array.

```typescript
{
  id: 'my-advisory',         // kebab-case, unique
  severity: 'medium',        // 'high' | 'medium' | 'low'
  title: 'Short title shown in UI',
  description: 'Explain why this is a problem and what impact it has.',
  action: 'Tell the user exactly what to do to fix it.',
  matches: (check) => check.id === 'my-api' && check.status === 'not_supported',
},
```

Rules are evaluated against every `CheckResult`. A rule fires if `matches()` returns `true` for any result.

---

## Adding a UI component

UI components live in `src/components/`. They are purely presentational — no data fetching, no engine calls.

```
src/components/
  ui/          ← shadcn/ui primitives (don't edit these manually)
  <name>.tsx   ← feature components
```

Use the project's CSS variables for colors (`--color-supported`, `--primary`, etc.) and the `cn()` utility from `@/lib/utils` for conditional classes.

---

## Database schema changes

1. Edit `src/lib/db/schema.ts`
2. Run `pnpm db:generate` — creates a migration file in `drizzle/migrations/`
3. Review the generated SQL
4. Run `pnpm db:push` locally against your dev Supabase project
5. The CI pipeline runs `pnpm db:migrate` after deploy in production

Never edit migration files by hand after they are generated.

---

## Environment variables

Never commit secrets. If you need a new env var:

1. Add it to `.env.example` with an empty value and a comment
2. Add it to your local `.env`
3. If it's needed in CI builds, add it as a GitHub Secret and reference it in `.github/workflows/ci.yml`
4. If it's needed in production at runtime, add it to the `production` GitHub environment

---

## Opening a pull request

- Target: `main`
- Title: follows conventional commits format — `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`
- CI must pass all 5 required checks before merge
- Self-review is acceptable (no required reviewers currently configured)

For large changes, open a draft PR early and describe your approach in the description.
