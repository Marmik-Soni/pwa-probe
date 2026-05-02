'use client';

import type { ScanStage } from '@/engine/types';
import { cn } from '@/lib/utils';

interface ScanProgressProps {
  stage: ScanStage;
  completed: number;
  total: number;
  className?: string;
}

const STAGE_LABELS: Record<ScanStage, string> = {
  1: 'Running parallel capability checks\u2026',
  2: 'Requesting permissions\u2026',
  3: 'Checking standalone-mode features\u2026',
};

export function ScanProgress({ stage, completed, total, className }: ScanProgressProps) {
  const isDeterminate = total > 0;
  const pct = isDeterminate ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{STAGE_LABELS[stage]}</span>
        {isDeterminate && <span className="text-muted-foreground font-mono">{pct}%</span>}
      </div>

      <div
        className="bg-muted h-1.5 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={isDeterminate ? total : undefined}
        aria-valuenow={isDeterminate ? completed : undefined}
        aria-label={STAGE_LABELS[stage]}
      >
        {isDeterminate ? (
          <div
            className="bg-primary h-full rounded-full transition-[width] duration-200"
            style={{ width: `${pct}%` }}
          />
        ) : (
          /* Indeterminate — pulsing bar while total checks are not yet known */
          <div className="bg-primary h-full w-1/3 animate-pulse rounded-full" />
        )}
      </div>
    </div>
  );
}
