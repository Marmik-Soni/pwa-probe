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

export const beforeInstallPromptCheck: ApiCheck = {
  id: 'before-install-prompt',
  name: 'Install Prompt Event',
  category: 'installability',
  description: 'Browser fires beforeinstallprompt, enabling custom install UI.',
  weight: 4,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('BeforeInstallPromptEvent' in window)) {
      return makeResult(
        beforeInstallPromptCheck,
        'not_supported',
        'BeforeInstallPromptEvent is not available in this browser.',
        start,
      );
    }
    return makeResult(
      beforeInstallPromptCheck,
      'supported',
      'BeforeInstallPromptEvent is available.',
      start,
    );
  },
};

export const webAppManifestCheck: ApiCheck = {
  id: 'web-app-manifest',
  name: 'Web App Manifest',
  category: 'installability',
  description: 'A manifest file is linked in the document head.',
  weight: 5,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/Manifest',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    const link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      return makeResult(
        webAppManifestCheck,
        'not_supported',
        'No <link rel="manifest"> found in the document.',
        start,
      );
    }
    return makeResult(
      webAppManifestCheck,
      'supported',
      'Web App Manifest is linked in the document.',
      start,
    );
  },
};

export const getInstalledRelatedAppsCheck: ApiCheck = {
  id: 'get-installed-related-apps',
  name: 'Get Installed Related Apps',
  category: 'installability',
  description: 'Detects if related native or web apps are already installed.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getInstalledRelatedApps',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('getInstalledRelatedApps' in navigator)) {
      return makeResult(
        getInstalledRelatedAppsCheck,
        'not_supported',
        'getInstalledRelatedApps is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        getInstalledRelatedAppsCheck,
        'https_required',
        'getInstalledRelatedApps requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(
      getInstalledRelatedAppsCheck,
      'supported',
      'getInstalledRelatedApps is available.',
      start,
    );
  },
};

export const standaloneDisplayModeCheck: ApiCheck = {
  id: 'standalone-display-mode',
  name: 'Standalone Display Mode',
  category: 'installability',
  description: 'App is running in standalone (installed PWA) display mode.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/display-mode',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return makeResult(
        standaloneDisplayModeCheck,
        'supported',
        'App is running in standalone display mode.',
        start,
      );
    }
    return makeResult(
      standaloneDisplayModeCheck,
      'not_supported',
      'App is not running in standalone mode — open in a browser tab.',
      start,
    );
  },
};

export const webInstallApiCheck: ApiCheck = {
  id: 'web-install-api',
  name: 'Web Install API',
  category: 'installability',
  description: 'navigator.install API for programmatic PWA installation.',
  weight: 2,
  stage: 1,
  known_support: { blink: 'partial', webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/install',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('install' in navigator)) {
      return makeResult(
        webInstallApiCheck,
        'not_supported',
        'Web Install API (navigator.install) is not available in this browser.',
        start,
      );
    }
    return makeResult(webInstallApiCheck, 'supported', 'Web Install API is available.', start);
  },
};

export const installabilityChecks: ApiCheck[] = [
  beforeInstallPromptCheck,
  webAppManifestCheck,
  getInstalledRelatedAppsCheck,
  standaloneDisplayModeCheck,
  webInstallApiCheck,
];
