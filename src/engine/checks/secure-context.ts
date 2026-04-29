import type { ApiCheck, CheckResult, CheckStatus } from '../types';

function makeResult(
  check: ApiCheck,
  status: CheckStatus,
  detail: string,
  start: number,
  permissionState: PermissionState | null = null,
): CheckResult {
  return {
    id: check.id,
    name: check.name,
    category: check.category,
    weight: check.weight,
    status,
    detail,
    duration_ms: Math.round(performance.now() - start),
    stage: check.stage,
    permission_state: permissionState,
    mdn_url: check.mdn_url,
    known_support: check.known_support,
  };
}

export const secureContextCheck: ApiCheck = {
  id: 'secure-context',
  name: 'Secure Context (HTTPS)',
  category: 'secure_context',
  description: 'Page is served over HTTPS or localhost, enabling secure APIs.',
  weight: 5,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!window.isSecureContext) {
      return makeResult(
        secureContextCheck,
        'not_supported',
        'Page is not running in a secure context. Many PWA APIs require HTTPS.',
        start,
      );
    }
    return makeResult(
      secureContextCheck,
      'supported',
      'Page is running in a secure context (HTTPS or localhost).',
      start,
    );
  },
};

export const crossOriginIsolatedCheck: ApiCheck = {
  id: 'cross-origin-isolated',
  name: 'Cross-Origin Isolation',
  category: 'secure_context',
  description: 'Page is cross-origin isolated (COOP + COEP headers), enabling SharedArrayBuffer.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!window.crossOriginIsolated) {
      return makeResult(
        crossOriginIsolatedCheck,
        'not_supported',
        'Page is not cross-origin isolated. Requires COOP and COEP headers.',
        start,
      );
    }
    return makeResult(
      crossOriginIsolatedCheck,
      'supported',
      'Page is cross-origin isolated.',
      start,
    );
  },
};

export const permissionsApiCheck: ApiCheck = {
  id: 'permissions-api',
  name: 'Permissions API',
  category: 'secure_context',
  description: 'Query the status of browser permission requests without prompting.',
  weight: 4,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('permissions' in navigator)) {
      return makeResult(
        permissionsApiCheck,
        'not_supported',
        'Permissions API is not available in this browser.',
        start,
      );
    }
    return makeResult(permissionsApiCheck, 'supported', 'Permissions API is available.', start);
  },
};

export const httpsDetectionCheck: ApiCheck = {
  id: 'https-detection',
  name: 'HTTPS Protocol',
  category: 'secure_context',
  description: 'Page is served over the HTTPS protocol.',
  weight: 5,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Glossary/HTTPS',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    const isHttps =
      location.protocol === 'https:' ||
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1' ||
      location.hostname === '[::1]';
    if (!isHttps) {
      return makeResult(
        httpsDetectionCheck,
        'not_supported',
        `Page is served over ${location.protocol} — HTTPS is required for most PWA features.`,
        start,
      );
    }
    return makeResult(
      httpsDetectionCheck,
      'supported',
      `Page is served over ${location.protocol} — secure context confirmed.`,
      start,
    );
  },
};

export const secureContextChecks: ApiCheck[] = [
  secureContextCheck,
  crossOriginIsolatedCheck,
  permissionsApiCheck,
  httpsDetectionCheck,
];
