import type { ScoreTier } from '@/engine/types';

export interface TierConfig {
  /** CSS custom-property string, e.g. `var(--color-supported)` */
  color: string;
  /** Human-readable label */
  label: string;
}

export const TIER_CONFIG: Record<ScoreTier, TierConfig> = {
  pwa_native: { color: 'var(--color-supported)', label: 'PWA Native' },
  pwa_ready: { color: 'var(--chart-2)', label: 'PWA Ready' },
  pwa_capable: { color: 'var(--chart-5)', label: 'PWA Capable' },
  web_only: { color: 'var(--color-not-supported)', label: 'Web Only' },
};

/**
 * Map a 0–100 score to the appropriate status colour.
 * Used by bars and rings that colour themselves based on score value rather than tier.
 */
export function getScoreColor(score: number): string {
  if (score >= 70) return 'var(--color-supported)';
  if (score >= 50) return 'var(--chart-5)';
  return 'var(--color-not-supported)';
}
