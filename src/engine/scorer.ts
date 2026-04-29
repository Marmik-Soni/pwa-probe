import type { CategoryScore, CheckCategory, CheckResult, CheckStatus, ScoreTier } from './types';

const STATUS_SCORES: Record<CheckStatus, number> = {
  supported: 1.0,
  partial: 0.5,
  permission_denied: 0.3,
  https_required: 0.1,
  not_supported: 0.0,
  not_tested: -1, // excluded from denominator
};

export const CATEGORY_LABELS: Record<CheckCategory, string> = {
  installability: 'Installability',
  service_worker: 'Service Worker',
  storage: 'Storage',
  push_notifications: 'Push & Notifications',
  device_hardware: 'Device Hardware',
  file_clipboard: 'File & Clipboard',
  identity_auth: 'Identity & Auth',
  media_capture: 'Media Capture',
  sensors_motion: 'Sensors & Motion',
  network_performance: 'Network Performance',
  windowing_ui: 'Windowing & UI',
  speech_ai: 'Speech & AI',
  payments_contacts: 'Payments & Contacts',
  secure_context: 'Secure Context',
};

export function calculateScore(checks: CheckResult[]): number {
  const tested = checks.filter((c) => c.status !== 'not_tested');
  if (tested.length === 0) return 0;

  const numerator = tested.reduce((sum, c) => sum + c.weight * STATUS_SCORES[c.status], 0);
  const denominator = tested.reduce((sum, c) => sum + c.weight, 0);

  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function calculateTier(score: number): ScoreTier {
  if (score >= 90) return 'pwa_native';
  if (score >= 70) return 'pwa_ready';
  if (score >= 50) return 'pwa_capable';
  return 'web_only';
}

export function calculateCategoryScores(checks: CheckResult[]): CategoryScore[] {
  const categories = [...new Set(checks.map((c) => c.category))];

  return categories.map((category) => {
    const categoryChecks = checks.filter((c) => c.category === category);
    const tested = categoryChecks.filter((c) => c.status !== 'not_tested');
    const passed = tested.filter((c) => c.status === 'supported');

    const numerator = tested.reduce((sum, c) => sum + c.weight * STATUS_SCORES[c.status], 0);
    const denominator = tested.reduce((sum, c) => sum + c.weight, 0);
    const score = denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;

    return {
      category,
      label: CATEGORY_LABELS[category],
      score,
      checks_total: categoryChecks.length,
      checks_passed: passed.length,
    };
  });
}
