import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateScore, calculateTier, calculateCategoryScores } from '../../../engine/scorer';
import type { CheckResult } from '../../../engine/types';

function makeCheck(overrides: Partial<CheckResult>): CheckResult {
  return {
    id: 'test-check',
    name: 'Test Check',
    category: 'secure_context',
    weight: 1,
    status: 'supported',
    detail: null,
    duration_ms: 0,
    stage: 1,
    permission_state: null,
    mdn_url: 'https://example.com',
    known_support: {},
    ...overrides,
  };
}

describe('scorer', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  describe('calculateScore', () => {
    it('returns 100 for all supported', () => {
      const checks = [
        makeCheck({ weight: 2, status: 'supported' }),
        makeCheck({ weight: 3, status: 'supported' }),
      ];
      expect(calculateScore(checks)).toBe(100);
    });

    it('returns 0 for all not_supported', () => {
      const checks = [makeCheck({ weight: 1, status: 'not_supported' })];
      expect(calculateScore(checks)).toBe(0);
    });

    it('returns 50 for partial', () => {
      const checks = [makeCheck({ weight: 1, status: 'partial' })];
      expect(calculateScore(checks)).toBe(50);
    });

    it('excludes not_tested checks from calculation', () => {
      const checks = [
        makeCheck({ weight: 1, status: 'supported' }),
        makeCheck({ weight: 1, status: 'not_tested' }),
      ];
      // Only one check counted: 1*1 / 1 = 100
      expect(calculateScore(checks)).toBe(100);
    });

    it('returns 0 for empty array', () => {
      expect(calculateScore([])).toBe(0);
    });

    it('returns 0 for all not_tested', () => {
      const checks = [makeCheck({ status: 'not_tested' })];
      expect(calculateScore(checks)).toBe(0);
    });

    it('handles mixed statuses with weights', () => {
      const checks = [
        makeCheck({ weight: 2, status: 'supported' }), // 2 * 1.0 = 2
        makeCheck({ weight: 2, status: 'not_supported' }), // 2 * 0.0 = 0
      ];
      // (2 + 0) / (2 + 2) = 0.5 = 50
      expect(calculateScore(checks)).toBe(50);
    });
  });

  describe('calculateTier', () => {
    it('returns pwa_native for score >= 90', () => {
      expect(calculateTier(90)).toBe('pwa_native');
      expect(calculateTier(100)).toBe('pwa_native');
    });

    it('returns pwa_ready for score >= 70', () => {
      expect(calculateTier(70)).toBe('pwa_ready');
      expect(calculateTier(89)).toBe('pwa_ready');
    });

    it('returns pwa_capable for score >= 50', () => {
      expect(calculateTier(50)).toBe('pwa_capable');
      expect(calculateTier(69)).toBe('pwa_capable');
    });

    it('returns web_only for score < 50', () => {
      expect(calculateTier(0)).toBe('web_only');
      expect(calculateTier(49)).toBe('web_only');
    });
  });

  describe('calculateCategoryScores', () => {
    it('groups checks by category', () => {
      const checks = [
        makeCheck({ category: 'installability', weight: 1, status: 'supported' }),
        makeCheck({ category: 'installability', weight: 1, status: 'not_supported' }),
        makeCheck({ category: 'storage', weight: 1, status: 'supported' }),
      ];
      const scores = calculateCategoryScores(checks);
      expect(scores).toHaveLength(2);
      const installability = scores.find((s) => s.category === 'installability');
      const storage = scores.find((s) => s.category === 'storage');
      expect(installability?.score).toBe(50);
      expect(storage?.score).toBe(100);
    });

    it('has correct checks_total and checks_passed', () => {
      const checks = [
        makeCheck({ category: 'storage', weight: 1, status: 'supported' }),
        makeCheck({ category: 'storage', weight: 1, status: 'supported' }),
        makeCheck({ category: 'storage', weight: 1, status: 'not_supported' }),
      ];
      const scores = calculateCategoryScores(checks);
      const storage = scores.find((s) => s.category === 'storage');
      expect(storage?.checks_total).toBe(3);
      expect(storage?.checks_passed).toBe(2);
    });
  });
});
