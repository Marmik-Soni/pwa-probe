'use client';

import { useEffect, useReducer, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';

import { AdvisoryCard } from '@/components/advisory-card';
import { CategoryBar } from '@/components/category-bar';
import { CheckCard } from '@/components/check-card';
import { DeviceChip } from '@/components/device-chip';
import { ScanProgress } from '@/components/scan-progress';
import { ScoreRing } from '@/components/score-ring';
import { Button } from '@/components/ui/button';
import { downloadReport } from '@/lib/download-report';
import { generateAdvisories } from '@/engine/advisor';
import { detectBrowser, detectDevice } from '@/engine/fingerprint';
import { CHECK_REGISTRY, runScan } from '@/engine/runner';
import { calculateCategoryScores, calculateScore, calculateTier } from '@/engine/scorer';
import type {
  Advisory,
  BrowserContext,
  CategoryScore,
  CheckResult,
  DeviceContext,
  ScanStage,
  ScoreTier,
} from '@/engine/types';

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

type ScanState =
  | {
      status: 'scanning';
      stage: ScanStage;
      completed: number;
      total: number;
      results: CheckResult[];
    }
  | {
      status: 'done';
      results: CheckResult[];
      score: number;
      tier: ScoreTier;
      categoryScores: CategoryScore[];
      advisories: Advisory[];
      device: DeviceContext;
      browser: BrowserContext;
    }
  | { status: 'error'; message: string };

type ScanAction =
  | { type: 'ADD_RESULT'; result: CheckResult }
  | { type: 'STAGE_COMPLETE'; nextStage: ScanStage }
  | {
      type: 'SCAN_DONE';
      results: CheckResult[];
      score: number;
      tier: ScoreTier;
      categoryScores: CategoryScore[];
      advisories: Advisory[];
      device: DeviceContext;
      browser: BrowserContext;
    }
  | { type: 'SCAN_ERROR'; message: string }
  | { type: 'RESET' };

const TOTAL_CHECKS = CHECK_REGISTRY.length;

const INITIAL_STATE: ScanState = {
  status: 'scanning',
  stage: 1,
  completed: 0,
  total: TOTAL_CHECKS,
  results: [],
};

function reducer(state: ScanState, action: ScanAction): ScanState {
  switch (action.type) {
    case 'ADD_RESULT':
      if (state.status !== 'scanning') return state;
      return {
        ...state,
        completed: state.completed + 1,
        results: [...state.results, action.result],
      };
    case 'STAGE_COMPLETE':
      if (state.status !== 'scanning') return state;
      return { ...state, stage: action.nextStage };
    case 'SCAN_DONE':
      return {
        status: 'done',
        results: action.results,
        score: action.score,
        tier: action.tier,
        categoryScores: action.categoryScores,
        advisories: action.advisories,
        device: action.device,
        browser: action.browser,
      };
    case 'SCAN_ERROR':
      return { status: 'error', message: action.message };
    case 'RESET':
      return { status: 'scanning', stage: 1, completed: 0, total: TOTAL_CHECKS, results: [] };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAGE_GROUP_LABELS: Record<ScanStage, string> = {
  1: 'Stage 1 — Capability Checks',
  2: 'Stage 2 — Permission Checks',
  3: 'Stage 3 — Standalone Features',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupByStage(results: CheckResult[]): Partial<Record<ScanStage, CheckResult[]>> {
  return results.reduce<Partial<Record<ScanStage, CheckResult[]>>>((acc, r) => {
    const list = acc[r.stage] ?? [];
    return { ...acc, [r.stage]: [...list, r] };
  }, {});
}

function groupByCategory(results: CheckResult[]): Record<string, CheckResult[]> {
  return results.reduce<Record<string, CheckResult[]>>((acc, r) => {
    const list = acc[r.category] ?? [];
    return { ...acc, [r.category]: [...list, r] };
  }, {});
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ScanPage() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  // Guard against React strict-mode double-invocation in dev
  const hasStarted = useRef(false);

  function startScan() {
    hasStarted.current = true;
    dispatch({ type: 'RESET' });

    runScan({
      onCheckComplete: (result) => {
        dispatch({ type: 'ADD_RESULT', result });
      },
      onStageComplete: (completedStage) => {
        const nextStage = (completedStage + 1) as ScanStage;
        if (nextStage <= 3) {
          dispatch({ type: 'STAGE_COMPLETE', nextStage });
        }
      },
    })
      .then((results) => {
        const score = calculateScore(results);
        dispatch({
          type: 'SCAN_DONE',
          results,
          score,
          tier: calculateTier(score),
          categoryScores: calculateCategoryScores(results),
          advisories: generateAdvisories(results),
          device: detectDevice(),
          browser: detectBrowser(),
        });
      })
      .catch((err: unknown) => {
        dispatch({
          type: 'SCAN_ERROR',
          message: err instanceof Error ? err.message : 'An unknown error occurred.',
        });
      });
  }

  // Auto-start on mount
  useEffect(() => {
    if (hasStarted.current) return;
    startScan();
  }, []);

  // -------------------------------------------------------------------------
  // Scanning view
  // -------------------------------------------------------------------------

  if (state.status === 'scanning') {
    const byStage = groupByStage(state.results);

    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
        <ScanProgress stage={state.stage} completed={state.completed} total={state.total} />

        {([1, 2, 3] as ScanStage[]).map((s) => {
          const stageResults = byStage[s];
          if (!stageResults?.length) return null;
          return (
            <section key={s} className="flex flex-col gap-2">
              <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                {STAGE_GROUP_LABELS[s]}
              </h2>
              {stageResults.map((r) => (
                <CheckCard key={r.id} result={r} />
              ))}
            </section>
          );
        })}
      </main>
    );
  }

  // -------------------------------------------------------------------------
  // Error view
  // -------------------------------------------------------------------------

  if (state.status === 'error') {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4 py-10 text-center">
        <p className="text-destructive text-sm">{state.message}</p>
        <Button variant="outline" onClick={startScan}>
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </main>
    );
  }

  // -------------------------------------------------------------------------
  // Done view
  // -------------------------------------------------------------------------

  const { score, tier, categoryScores, advisories, results } = state;
  const byCategory = groupByCategory(results);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
      {/* Back nav */}
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs"
      >
        <ArrowLeft className="h-3 w-3" />
        Back
      </Link>

      {/* Score header */}
      <section className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
        <ScoreRing score={score} tier={tier} size={160} />
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h1 className="font-display text-foreground text-2xl font-bold">PWA Score</h1>
          <DeviceChip />
        </div>
      </section>

      {/* Category breakdown */}
      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          By Category
        </h2>
        {categoryScores.map((cs) => (
          <CategoryBar key={cs.category} score={cs} />
        ))}
      </section>

      {/* Advisories */}
      {advisories.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Recommendations
          </h2>
          {advisories.map((a) => (
            <AdvisoryCard key={a.id} advisory={a} />
          ))}
        </section>
      )}

      {/* Full check list grouped by category */}
      <section className="flex flex-col gap-6">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          All Checks
        </h2>
        {Object.entries(byCategory).map(([category, categoryResults]) => (
          <div key={category} className="flex flex-col gap-2">
            <h3 className="text-foreground text-sm font-medium">
              {categoryScores.find((cs) => cs.category === category)?.label ?? category}
            </h3>
            {categoryResults.map((r) => (
              <CheckCard key={r.id} result={r} />
            ))}
          </div>
        ))}
      </section>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3 pb-4">
        <Button variant="outline" onClick={() => downloadReport(state)}>
          <Download className="h-4 w-4" />
          Download Report
        </Button>
        <Button variant="outline" onClick={startScan}>
          <RefreshCw className="h-4 w-4" />
          Re-scan
        </Button>
      </div>
    </main>
  );
}
