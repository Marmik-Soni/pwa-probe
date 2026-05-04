import type {
  Advisory,
  BrowserContext,
  CategoryScore,
  CheckResult,
  DeviceContext,
  ScanRecord,
  ScoreTier,
} from '@/engine/types';

interface DownloadReportState {
  results: CheckResult[];
  score: number;
  tier: ScoreTier;
  categoryScores: CategoryScore[];
  advisories: Advisory[];
  device: DeviceContext;
  browser: BrowserContext;
}

export function downloadReport(state: DownloadReportState): void {
  const record: ScanRecord = {
    id: crypto.randomUUID(),
    user_id: null,
    share_token: crypto.randomUUID(),
    scanned_at: new Date().toISOString(),
    score: state.score,
    tier: state.tier,
    stage_reached: 3,
    device: state.device,
    browser: state.browser,
    checks: state.results,
    category_scores: state.categoryScores,
    advisories: state.advisories,
  };

  const json = JSON.stringify(record, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const a = document.createElement('a');
  a.href = url;
  a.download = `pwa-probe-report-${date}.json`;
  a.click();

  URL.revokeObjectURL(url);
}
