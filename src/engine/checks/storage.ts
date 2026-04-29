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

export const indexedDbCheck: ApiCheck = {
  id: 'indexed-db',
  name: 'IndexedDB',
  category: 'storage',
  description: 'Low-level API for client-side structured data storage.',
  weight: 4,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('indexedDB' in window)) {
      return makeResult(
        indexedDbCheck,
        'not_supported',
        'IndexedDB is not available in this browser.',
        start,
      );
    }
    return makeResult(indexedDbCheck, 'supported', 'IndexedDB is available.', start);
  },
};

export const cacheApiCheck: ApiCheck = {
  id: 'cache-api',
  name: 'Cache API',
  category: 'storage',
  description: 'Cache Request/Response pairs for offline use.',
  weight: 5,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Cache',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('caches' in window)) {
      return makeResult(
        cacheApiCheck,
        'not_supported',
        'Cache API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        cacheApiCheck,
        'https_required',
        'Cache API requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(cacheApiCheck, 'supported', 'Cache API is available.', start);
  },
};

export const storageEstimateCheck: ApiCheck = {
  id: 'storage-estimate',
  name: 'Storage Manager',
  category: 'storage',
  description: 'Query available storage quota and usage.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/StorageManager',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return makeResult(
        storageEstimateCheck,
        'not_supported',
        'StorageManager.estimate() is not available in this browser.',
        start,
      );
    }
    return makeResult(
      storageEstimateCheck,
      'supported',
      'Storage Manager API is available.',
      start,
    );
  },
};

export const localStorageCheck: ApiCheck = {
  id: 'local-storage',
  name: 'localStorage',
  category: 'storage',
  description: 'Synchronous key-value storage persisted across sessions.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('localStorage' in window)) {
      return makeResult(
        localStorageCheck,
        'not_supported',
        'localStorage is not available in this browser.',
        start,
      );
    }
    return makeResult(localStorageCheck, 'supported', 'localStorage is available.', start);
  },
};

export const sessionStorageCheck: ApiCheck = {
  id: 'session-storage',
  name: 'sessionStorage',
  category: 'storage',
  description: 'Synchronous key-value storage scoped to the session.',
  weight: 1,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('sessionStorage' in window)) {
      return makeResult(
        sessionStorageCheck,
        'not_supported',
        'sessionStorage is not available in this browser.',
        start,
      );
    }
    return makeResult(sessionStorageCheck, 'supported', 'sessionStorage is available.', start);
  },
};

export const opfsCheck: ApiCheck = {
  id: 'opfs',
  name: 'Origin Private File System',
  category: 'storage',
  description: 'High-performance file storage local to the origin (OPFS).',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url:
    'https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    const storageNav = navigator.storage as StorageManager & {
      getDirectory?: () => Promise<unknown>;
    };
    if (!('storage' in navigator) || typeof storageNav.getDirectory !== 'function') {
      return makeResult(
        opfsCheck,
        'not_supported',
        'Origin Private File System (navigator.storage.getDirectory) is not available.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        opfsCheck,
        'https_required',
        'OPFS requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(opfsCheck, 'supported', 'Origin Private File System is available.', start);
  },
};

export const storageChecks: ApiCheck[] = [
  indexedDbCheck,
  cacheApiCheck,
  storageEstimateCheck,
  localStorageCheck,
  sessionStorageCheck,
  opfsCheck,
];
