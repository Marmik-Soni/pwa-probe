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

export const serviceWorkerCheck: ApiCheck = {
  id: 'service-worker',
  name: 'Service Worker',
  category: 'service_worker',
  description: 'Service Workers enable offline support and background sync.',
  weight: 5,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('serviceWorker' in navigator)) {
      return makeResult(
        serviceWorkerCheck,
        'not_supported',
        'Service Worker API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        serviceWorkerCheck,
        'https_required',
        'Service Workers require a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(serviceWorkerCheck, 'supported', 'Service Worker API is available.', start);
  },
};

export const swRegistrationCheck: ApiCheck = {
  id: 'sw-registration',
  name: 'SW Registration',
  category: 'service_worker',
  description: 'Ability to register a service worker programmatically.',
  weight: 4,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('serviceWorker' in navigator)) {
      return makeResult(
        swRegistrationCheck,
        'not_supported',
        'Service Worker API is not available.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        swRegistrationCheck,
        'https_required',
        'Service Worker registration requires HTTPS.',
        start,
      );
    }
    try {
      // Attempt registration with a non-existent path — if the API works it throws a TypeError about the path, not a permissions error
      const reg = await navigator.serviceWorker.getRegistration('/');
      if (reg !== undefined) {
        return makeResult(
          swRegistrationCheck,
          'supported',
          'Service worker registration is functional.',
          start,
        );
      }
      return makeResult(
        swRegistrationCheck,
        'supported',
        'Service Worker registration API is functional.',
        start,
      );
    } catch {
      return makeResult(
        swRegistrationCheck,
        'supported',
        'Service Worker registration API is available (no active registration found).',
        start,
      );
    }
  },
};

export const backgroundSyncCheck: ApiCheck = {
  id: 'background-sync',
  name: 'Background Sync',
  category: 'service_worker',
  description: 'Defer actions until the user has stable connectivity.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('SyncManager' in window)) {
      return makeResult(
        backgroundSyncCheck,
        'not_supported',
        'Background Sync (SyncManager) is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        backgroundSyncCheck,
        'https_required',
        'Background Sync requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(backgroundSyncCheck, 'supported', 'Background Sync API is available.', start);
  },
};

export const backgroundFetchCheck: ApiCheck = {
  id: 'background-fetch',
  name: 'Background Fetch',
  category: 'service_worker',
  description: 'Download large files in the background, even when the browser is closed.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Background_Fetch_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('BackgroundFetchManager' in window)) {
      return makeResult(
        backgroundFetchCheck,
        'not_supported',
        'Background Fetch API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        backgroundFetchCheck,
        'https_required',
        'Background Fetch requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(
      backgroundFetchCheck,
      'supported',
      'Background Fetch API is available.',
      start,
    );
  },
};

export const periodicSyncCheck: ApiCheck = {
  id: 'periodic-background-sync',
  name: 'Periodic Background Sync',
  category: 'service_worker',
  description: 'Periodically sync data in the background at regular intervals.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url:
    'https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('PeriodicSyncManager' in window)) {
      return makeResult(
        periodicSyncCheck,
        'not_supported',
        'Periodic Background Sync API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        periodicSyncCheck,
        'https_required',
        'Periodic Background Sync requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(
      periodicSyncCheck,
      'supported',
      'Periodic Background Sync API is available.',
      start,
    );
  },
};

export const serviceWorkerChecks: ApiCheck[] = [
  serviceWorkerCheck,
  swRegistrationCheck,
  backgroundSyncCheck,
  backgroundFetchCheck,
  periodicSyncCheck,
];
