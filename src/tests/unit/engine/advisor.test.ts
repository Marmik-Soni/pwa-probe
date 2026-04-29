import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAdvisories } from '../../../engine/advisor';
import type { CheckResult } from '../../../engine/types';

function makeCheck(id: string, status: CheckResult['status']): CheckResult {
  return {
    id,
    name: id,
    category: 'secure_context',
    weight: 1,
    status,
    detail: null,
    duration_ms: 0,
    stage: 1,
    permission_state: null,
    mdn_url: 'https://example.com',
    known_support: {},
  };
}

describe('advisor', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns empty array when no checks match advisory rules', () => {
    const checks = [makeCheck('some-unknown-check', 'supported')];
    const advisories = generateAdvisories(checks);
    expect(advisories).toHaveLength(0);
  });

  it('generates high-severity advisory for no https', () => {
    const checks = [makeCheck('https-detection', 'not_supported')];
    const advisories = generateAdvisories(checks);
    const advisory = advisories.find((a) => a.id === 'no-https');
    expect(advisory).toBeDefined();
    expect(advisory?.severity).toBe('high');
    expect(advisory?.affected_checks).toContain('https-detection');
  });

  it('generates high-severity advisory for no manifest', () => {
    const checks = [makeCheck('web-app-manifest', 'not_supported')];
    const advisories = generateAdvisories(checks);
    const advisory = advisories.find((a) => a.id === 'no-manifest');
    expect(advisory).toBeDefined();
    expect(advisory?.severity).toBe('high');
  });

  it('generates high-severity advisory for no service worker', () => {
    const checks = [makeCheck('service-worker', 'not_supported')];
    const advisories = generateAdvisories(checks);
    const advisory = advisories.find((a) => a.id === 'no-service-worker');
    expect(advisory).toBeDefined();
    expect(advisory?.severity).toBe('high');
  });

  it('generates medium severity advisory for denied notifications', () => {
    const checks = [makeCheck('notification-api', 'permission_denied')];
    const advisories = generateAdvisories(checks);
    const advisory = advisories.find((a) => a.id === 'permission-denied-notifications');
    expect(advisory).toBeDefined();
    expect(advisory?.severity).toBe('medium');
  });

  it('does NOT generate notification advisory when supported', () => {
    const checks = [makeCheck('notification-api', 'supported')];
    const advisories = generateAdvisories(checks);
    expect(advisories.find((a) => a.id === 'permission-denied-notifications')).toBeUndefined();
  });

  it('sorts advisories high > medium > low', () => {
    const checks = [
      makeCheck('https-detection', 'not_supported'), // high
      makeCheck('notification-api', 'permission_denied'), // medium
      makeCheck('before-install-prompt', 'not_supported'), // low
    ];
    const advisories = generateAdvisories(checks);
    expect(advisories.length).toBeGreaterThan(0);
    const severities = advisories.map((a) => a.severity);
    const order = severities.map((s) => ({ high: 0, medium: 1, low: 2 })[s] as number);
    for (let i = 1; i < order.length; i++) {
      expect(order[i]).toBeGreaterThanOrEqual(order[i - 1]!);
    }
  });

  it('includes action field with guidance', () => {
    const checks = [makeCheck('https-detection', 'not_supported')];
    const advisories = generateAdvisories(checks);
    expect(advisories[0]?.action).toBeTruthy();
  });
});
