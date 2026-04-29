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

export const networkInformationCheck: ApiCheck = {
  id: 'network-information',
  name: 'Network Information API',
  category: 'network_performance',
  description: 'Read network type, effective connection type, and downlink speed.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('connection' in navigator)) {
      return makeResult(
        networkInformationCheck,
        'not_supported',
        'Network Information API is not available in this browser.',
        start,
      );
    }
    return makeResult(
      networkInformationCheck,
      'supported',
      'Network Information API is available.',
      start,
    );
  },
};

export const saveDataCheck: ApiCheck = {
  id: 'save-data',
  name: 'Save-Data Hint',
  category: 'network_performance',
  description: 'Detect if the user has requested reduced data usage.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    };
    if (!nav.connection) {
      return makeResult(
        saveDataCheck,
        'not_supported',
        'Network Information API (required for Save-Data) is not available.',
        start,
      );
    }
    if (nav.connection.saveData === true) {
      return makeResult(
        saveDataCheck,
        'supported',
        'Save-Data mode is enabled by the user.',
        start,
      );
    }
    return makeResult(
      saveDataCheck,
      'supported',
      'Save-Data hint is available (currently not enabled).',
      start,
    );
  },
};

export const onLineCheck: ApiCheck = {
  id: 'online-status',
  name: 'Online/Offline Detection',
  category: 'network_performance',
  description: 'Detect whether the browser is online or offline.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('onLine' in navigator)) {
      return makeResult(
        onLineCheck,
        'not_supported',
        'navigator.onLine is not available in this browser.',
        start,
      );
    }
    return makeResult(
      onLineCheck,
      'supported',
      `Online/offline detection is available (currently ${navigator.onLine ? 'online' : 'offline'}).`,
      start,
    );
  },
};

export const effectiveTypeCheck: ApiCheck = {
  id: 'effective-connection-type',
  name: 'Effective Connection Type',
  category: 'network_performance',
  description: 'Detect the effective network type (4g, 3g, 2g, slow-2g).',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/effectiveType',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
    if (!nav.connection || !nav.connection.effectiveType) {
      return makeResult(
        effectiveTypeCheck,
        'not_supported',
        'Effective connection type detection is not available in this browser.',
        start,
      );
    }
    return makeResult(
      effectiveTypeCheck,
      'supported',
      `Effective connection type is available (currently ${nav.connection.effectiveType}).`,
      start,
    );
  },
};

export const networkPerformanceChecks: ApiCheck[] = [
  networkInformationCheck,
  saveDataCheck,
  onLineCheck,
  effectiveTypeCheck,
];
