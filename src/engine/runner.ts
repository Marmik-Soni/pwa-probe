import type { CheckResult, ScanStage } from './types';
import { CHECK_REGISTRY } from './checks/index';

export interface RunnerOptions {
  onCheckComplete: (result: CheckResult) => void;
  onStageComplete?: (stage: ScanStage, results: CheckResult[]) => void;
}

export async function runScan(options: RunnerOptions): Promise<CheckResult[]> {
  const { onCheckComplete, onStageComplete } = options;
  const allResults: CheckResult[] = [];

  // Stage 1: run all stage-1 checks in parallel
  const stage1Checks = CHECK_REGISTRY.filter((c) => c.stage === 1);
  const stage1Results = await Promise.all(stage1Checks.map((c) => c.run()));
  for (const result of stage1Results) {
    onCheckComplete(result);
    allResults.push(result);
  }
  onStageComplete?.(1, stage1Results);

  // Stage 2: run sequentially (one permission dialog at a time)
  const stage2Checks = CHECK_REGISTRY.filter((c) => c.stage === 2);
  const stage2Results: CheckResult[] = [];
  for (const check of stage2Checks) {
    const result = await check.run();
    onCheckComplete(result);
    allResults.push(result);
    stage2Results.push(result);
  }
  onStageComplete?.(2, stage2Results);

  // Stage 3: only runs if matchMedia('(display-mode: standalone)').matches
  const stage3Results: CheckResult[] = [];
  if (window.matchMedia('(display-mode: standalone)').matches) {
    const stage3Checks = CHECK_REGISTRY.filter((c) => c.stage === 3);
    const results = await Promise.all(stage3Checks.map((c) => c.run()));
    for (const result of results) {
      onCheckComplete(result);
      allResults.push(result);
      stage3Results.push(result);
    }
    onStageComplete?.(3, stage3Results);
  }

  return allResults;
}

export { CHECK_REGISTRY };
