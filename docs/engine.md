# Detection Engine

The engine is the core of PWA Probe. It lives in `src/engine/` and has zero dependencies on React, Next.js, or any UI library. It can be tested in jsdom and could theoretically be published as a standalone package.

---

## Entry points

```typescript
import { runScan } from '@/engine/runner';
import { calculateScore, calculateTier, calculateCategoryScores } from '@/engine/scorer';
import { generateAdvisories } from '@/engine/advisor';
import { detectDevice, detectBrowser } from '@/engine/fingerprint';
import { CHECK_REGISTRY } from '@/engine/checks';
```

---

## Types (`types.ts`)

### `ApiCheck`

The definition of a single capability check.

```typescript
interface ApiCheck {
  id: string; // kebab-case unique ID e.g. 'service-worker'
  name: string; // human-readable e.g. 'Service Worker'
  category: CheckCategory;
  description: string;
  weight: number; // 1–5 — importance in scoring
  stage: ScanStage; // 1 | 2 | 3
  requires_permission?: string; // Permissions API descriptor if applicable
  known_support: Partial<Record<BrowserEngine, boolean | 'partial'>>;
  mdn_url: string;
  run: () => Promise<CheckResult>;
}
```

### `CheckResult`

The output of a single check run.

```typescript
interface CheckResult {
  id: string;
  name: string;
  category: CheckCategory;
  weight: number;
  status: CheckStatus; // see below
  detail: string | null; // human-readable explanation of the result
  duration_ms: number;
  stage: ScanStage;
  permission_state: PermissionState | null;
  mdn_url: string;
  known_support: ApiCheck['known_support'];
}
```

### `CheckStatus`

| Value               | Meaning                                  |
| ------------------- | ---------------------------------------- |
| `supported`         | API is available and functional          |
| `partial`           | API exists but with limitations          |
| `permission_denied` | User denied the required permission      |
| `https_required`    | API exists but requires a secure context |
| `not_supported`     | API is not available in this browser     |
| `not_tested`        | Check was skipped (wrong stage context)  |

### `ScoreTier`

| Value         | Score range | Meaning                             |
| ------------- | ----------- | ----------------------------------- |
| `pwa_native`  | ≥ 90        | Near-complete native app parity     |
| `pwa_ready`   | ≥ 70        | Installable + offline capable       |
| `pwa_capable` | ≥ 50        | PWA foundation exists, gaps present |
| `web_only`    | < 50        | Critical PWA features missing       |

---

## Check categories

14 categories, ~80 checks total:

| Category ID           | Label                | What it checks                                               |
| --------------------- | -------------------- | ------------------------------------------------------------ |
| `secure_context`      | Secure Context       | HTTPS, cross-origin isolation                                |
| `installability`      | Installability       | Web App Manifest, beforeinstallprompt, display modes         |
| `service_worker`      | Service Worker       | Registration, background sync, periodic sync                 |
| `storage`             | Storage              | IndexedDB, Cache API, Storage Manager, OPFS                  |
| `push_notifications`  | Push & Notifications | Push API, Notifications API, badge API                       |
| `device_hardware`     | Device Hardware      | Bluetooth, USB, HID, NFC, vibration, battery                 |
| `file_clipboard`      | File & Clipboard     | File System Access, Clipboard API, drag-drop                 |
| `identity_auth`       | Identity & Auth      | Web Authentication (Passkeys), Credential Management         |
| `media_capture`       | Media Capture        | Camera, microphone, screen capture, MediaRecorder            |
| `sensors_motion`      | Sensors & Motion     | Geolocation, DeviceMotion, DeviceOrientation, Gyroscope      |
| `network_performance` | Network Performance  | Network Information API, Background Fetch, navigation timing |
| `windowing_ui`        | Windowing & UI       | Window Controls Overlay, Display Override, Fullscreen        |
| `speech_ai`           | Speech & AI          | Web Speech API, Web Neural Network (WebNN)                   |
| `payments_contacts`   | Payments & Contacts  | Payment Request API, Contact Picker API                      |

---

## Runner (`runner.ts`)

`runScan(options)` orchestrates the full scan across 3 stages.

```typescript
interface RunnerOptions {
  onCheckComplete: (result: CheckResult) => void; // called as each check finishes
  onStageComplete?: (stage: ScanStage, results: CheckResult[]) => void;
}

async function runScan(options: RunnerOptions): Promise<CheckResult[]>;
```

### Stage execution

**Stage 1** — All stage-1 checks run in parallel via `Promise.all`. These are non-permission APIs that can't block each other.

**Stage 2** — Stage-2 checks run sequentially (one at a time). This prevents multiple browser permission dialogs appearing simultaneously, which browsers may suppress or confuse users.

**Stage 3** — Only runs if `window.matchMedia('(display-mode: standalone)').matches`. Stage-3 checks test APIs only meaningful when the app is installed. If the app is not installed, these checks would all return `not_tested`.

### Live streaming

Each result is delivered to `onCheckComplete` as it completes — not batched at the end. This lets the UI update in real time as the scan progresses.

---

## Scorer (`scorer.ts`)

### `calculateScore(checks: CheckResult[]): number`

Returns a 0–100 integer.

Status → multiplier mapping:

```
supported          → 1.0
partial            → 0.5
permission_denied  → 0.3
https_required     → 0.1
not_supported      → 0.0
not_tested         → excluded from denominator
```

Formula: `Math.round( Σ(weight × multiplier) / Σ(weight) × 100 )`

### `calculateTier(score: number): ScoreTier`

```
score ≥ 90  →  pwa_native
score ≥ 70  →  pwa_ready
score ≥ 50  →  pwa_capable
score  < 50  →  web_only
```

### `calculateCategoryScores(checks: CheckResult[]): CategoryScore[]`

Same weighted formula applied per category. Returns one `CategoryScore` per category present in the results.

---

## Advisor (`advisor.ts`)

`generateAdvisories(checks: CheckResult[]): Advisory[]`

Runs 11 rules against the results. Each rule has a `matches()` predicate. If the predicate returns `true` for any check, the advisory is included in the output.

### Current advisory rules

| Rule ID                | Severity | Trigger                                         |
| ---------------------- | -------- | ----------------------------------------------- |
| `no-https`             | high     | HTTPS detection is `not_supported`              |
| `no-manifest`          | high     | Web App Manifest is `not_supported`             |
| `no-service-worker`    | high     | Service Worker is `not_supported`               |
| `no-indexeddb`         | medium   | IndexedDB is `not_supported`                    |
| `no-push`              | medium   | Push API is `not_supported`                     |
| `notifications-denied` | medium   | Notifications permission is `permission_denied` |
| `geolocation-denied`   | low      | Geolocation permission is `permission_denied`   |
| `camera-denied`        | low      | Camera permission is `permission_denied`        |
| `no-background-sync`   | low      | Background Sync is `not_supported`              |
| `no-wco`               | low      | Window Controls Overlay is `not_supported`      |
| `no-passkeys`          | low      | WebAuthn is `not_supported`                     |

---

## Fingerprint (`fingerprint.ts`)

### `detectDevice(): DeviceContext`

Detects platform, form factor, screen dimensions, CPU cores, memory, connection type, and whether the app is running in standalone (installed) mode.

### `detectBrowser(): BrowserContext`

Detects browser name, version, rendering engine, secure context status, cross-origin isolation, language, and raw user agent.

---

## Writing a new check

1. **Find the right category file** in `src/engine/checks/` or create one if needed.

2. **Define the check:**

```typescript
import type { ApiCheck } from '../types';
import { makeResult } from '../utils'; // (if a helper exists)

export const myNewChecks: ApiCheck[] = [
  {
    id: 'my-api',
    name: 'My API',
    category: 'windowing_ui',
    description: 'Checks whether My API is available.',
    weight: 2,
    stage: 1,
    known_support: { blink: true, webkit: false, gecko: 'partial' },
    mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/MyAPI',
    async run() {
      const start = performance.now();
      const status = 'myAPI' in window ? 'supported' : 'not_supported';
      return {
        id: this.id,
        name: this.name,
        category: this.category,
        weight: this.weight,
        status,
        detail: status === 'supported' ? 'My API is available.' : 'My API is not available.',
        duration_ms: Math.round(performance.now() - start),
        stage: this.stage,
        permission_state: null,
        mdn_url: this.mdn_url,
        known_support: this.known_support,
      };
    },
  },
];
```

3. **Register it** in `src/engine/checks/index.ts`:

```typescript
import { myNewChecks } from './my-category';

export const CHECK_REGISTRY: ApiCheck[] = [
  // ...existing checks...
  ...myNewChecks,
];
```

4. **Write a unit test** in `src/tests/unit/engine/checks/my-category.test.ts`.

See [docs/contributing.md](contributing.md) for the full guide on check authorship conventions.

---

## Unit tests

Tests live in `src/tests/unit/engine/`. Run with:

```bash
pnpm test              # single run
pnpm test:watch        # watch mode
pnpm test:coverage     # with v8 coverage
```

The test environment is `jsdom`, configured in `vitest.config.ts`. Browser APIs not available in jsdom are mocked at the test file level or in a shared `setup.ts`.

Currently: **46 tests, all passing**.
