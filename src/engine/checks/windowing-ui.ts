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

export const windowControlsOverlayCheck: ApiCheck = {
  id: 'window-controls-overlay',
  name: 'Window Controls Overlay',
  category: 'windowing_ui',
  description: 'Extend PWA content into the title bar area.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window_Controls_Overlay_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('windowControlsOverlay' in navigator)) {
      return makeResult(
        windowControlsOverlayCheck,
        'not_supported',
        'Window Controls Overlay API is not available in this browser.',
        start,
      );
    }
    return makeResult(
      windowControlsOverlayCheck,
      'supported',
      'Window Controls Overlay API is available.',
      start,
    );
  },
};

export const launchHandlerCheck: ApiCheck = {
  id: 'launch-handler',
  name: 'Launch Handler API',
  category: 'windowing_ui',
  description: 'Control how PWA handles launch events and navigation.',
  weight: 2,
  stage: 3,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Launch_Handler_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('launchQueue' in window)) {
      return makeResult(
        launchHandlerCheck,
        'not_supported',
        'Launch Handler API (launchQueue) is not available in this browser.',
        start,
      );
    }
    return makeResult(launchHandlerCheck, 'supported', 'Launch Handler API is available.', start);
  },
};

export const multiScreenCheck: ApiCheck = {
  id: 'multi-screen-window',
  name: 'Multi-Screen Window Placement',
  category: 'windowing_ui',
  description: 'Place windows across multiple displays.',
  weight: 2,
  stage: 1,
  requires_permission: 'window-management',
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window_Management_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('getScreenDetails' in window)) {
      return makeResult(
        multiScreenCheck,
        'not_supported',
        'Multi-Screen Window Placement API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        multiScreenCheck,
        'https_required',
        'Multi-Screen Window Placement requires a secure context (HTTPS).',
        start,
      );
    }
    try {
      const result = await navigator.permissions.query({
        name: 'window-management' as PermissionName,
      });
      if (result.state === 'granted') {
        return makeResult(
          multiScreenCheck,
          'supported',
          'Multi-Screen Window Placement API is available and permission is granted.',
          start,
          result.state,
        );
      }
      if (result.state === 'denied') {
        return makeResult(
          multiScreenCheck,
          'permission_denied',
          'Window management permission was denied.',
          start,
          result.state,
        );
      }
      return makeResult(
        multiScreenCheck,
        'not_tested',
        'Multi-Screen Window Placement API is available.',
        start,
        result.state,
      );
    } catch {
      return makeResult(
        multiScreenCheck,
        'not_tested',
        'Multi-Screen Window Placement API is available — permission state unknown.',
        start,
      );
    }
  },
};

export const viewTransitionsCheck: ApiCheck = {
  id: 'view-transitions',
  name: 'View Transitions API',
  category: 'windowing_ui',
  description: 'Animate between page transitions like a native app.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: 'partial' },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (!('startViewTransition' in document) || typeof doc.startViewTransition !== 'function') {
      return makeResult(
        viewTransitionsCheck,
        'not_supported',
        'View Transitions API is not available in this browser.',
        start,
      );
    }
    return makeResult(
      viewTransitionsCheck,
      'supported',
      'View Transitions API is available.',
      start,
    );
  },
};

export const protocolHandlerCheck: ApiCheck = {
  id: 'protocol-handler',
  name: 'Protocol Handler Registration',
  category: 'windowing_ui',
  description: 'Register the PWA to handle custom URL protocols.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/registerProtocolHandler',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('registerProtocolHandler' in navigator)) {
      return makeResult(
        protocolHandlerCheck,
        'not_supported',
        'registerProtocolHandler is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        protocolHandlerCheck,
        'https_required',
        'Protocol handler registration requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(
      protocolHandlerCheck,
      'supported',
      'Protocol handler registration is available.',
      start,
    );
  },
};

export const shortcutsProxyCheck: ApiCheck = {
  id: 'navigator-standalone',
  name: 'PWA Standalone Detection',
  category: 'windowing_ui',
  description: 'Detect if running as a standalone PWA via navigator.standalone.',
  weight: 1,
  stage: 1,
  known_support: { blink: false, webkit: true, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/standalone',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    const nav = navigator as Navigator & { standalone?: boolean };
    if (!('standalone' in navigator)) {
      // This is Safari-specific; treat as partial — standard browsers use matchMedia
      return makeResult(
        shortcutsProxyCheck,
        'partial',
        'navigator.standalone is not available (Safari-only). Use matchMedia for cross-browser detection.',
        start,
      );
    }
    if (nav.standalone === true) {
      return makeResult(
        shortcutsProxyCheck,
        'supported',
        'App is running as a standalone PWA (navigator.standalone = true).',
        start,
      );
    }
    return makeResult(
      shortcutsProxyCheck,
      'supported',
      'navigator.standalone is available (currently false — not installed).',
      start,
    );
  },
};

export const windowingUiChecks: ApiCheck[] = [
  windowControlsOverlayCheck,
  launchHandlerCheck,
  multiScreenCheck,
  viewTransitionsCheck,
  protocolHandlerCheck,
  shortcutsProxyCheck,
];
