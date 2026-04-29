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

export const fileSystemAccessCheck: ApiCheck = {
  id: 'file-system-access',
  name: 'File System Access',
  category: 'file_clipboard',
  description: 'Open, save, and manage files on the local file system.',
  weight: 4,
  stage: 1,
  known_support: { blink: true, webkit: 'partial', gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('showOpenFilePicker' in window)) {
      return makeResult(
        fileSystemAccessCheck,
        'not_supported',
        'File System Access API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        fileSystemAccessCheck,
        'https_required',
        'File System Access requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(
      fileSystemAccessCheck,
      'supported',
      'File System Access API is available.',
      start,
    );
  },
};

export const fileHandlingCheck: ApiCheck = {
  id: 'file-handling',
  name: 'File Handling API',
  category: 'file_clipboard',
  description: 'Register the PWA as a file handler for specific file types.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Launch_Handler_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('launchQueue' in window)) {
      return makeResult(
        fileHandlingCheck,
        'not_supported',
        'File Handling API (launchQueue) is not available in this browser.',
        start,
      );
    }
    return makeResult(fileHandlingCheck, 'supported', 'File Handling API is available.', start);
  },
};

export const clipboardApiCheck: ApiCheck = {
  id: 'clipboard-api',
  name: 'Clipboard API',
  category: 'file_clipboard',
  description: 'Asynchronous read/write access to the system clipboard.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('clipboard' in navigator)) {
      return makeResult(
        clipboardApiCheck,
        'not_supported',
        'Clipboard API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        clipboardApiCheck,
        'https_required',
        'Clipboard API requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(clipboardApiCheck, 'supported', 'Clipboard API is available.', start);
  },
};

export const clipboardReadCheck: ApiCheck = {
  id: 'clipboard-read',
  name: 'Clipboard Read',
  category: 'file_clipboard',
  description: 'Read arbitrary data (images, text) from the clipboard.',
  weight: 2,
  stage: 1,
  requires_permission: 'clipboard-read',
  known_support: { blink: true, webkit: 'partial', gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/read',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('clipboard' in navigator)) {
      return makeResult(
        clipboardReadCheck,
        'not_supported',
        'Clipboard API is not available.',
        start,
      );
    }
    if (!('read' in navigator.clipboard)) {
      return makeResult(
        clipboardReadCheck,
        'not_supported',
        'Clipboard.read() is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        clipboardReadCheck,
        'https_required',
        'Clipboard read requires a secure context (HTTPS).',
        start,
      );
    }
    try {
      const result = await navigator.permissions.query({
        name: 'clipboard-read' as PermissionName,
      });
      if (result.state === 'granted') {
        return makeResult(
          clipboardReadCheck,
          'supported',
          'Clipboard read is available and permission is granted.',
          start,
          result.state,
        );
      }
      if (result.state === 'denied') {
        return makeResult(
          clipboardReadCheck,
          'permission_denied',
          'Clipboard read permission was denied.',
          start,
          result.state,
        );
      }
      return makeResult(
        clipboardReadCheck,
        'not_tested',
        'Clipboard read is available — permission not yet requested.',
        start,
        result.state,
      );
    } catch {
      return makeResult(
        clipboardReadCheck,
        'not_tested',
        'Clipboard read is available — permission state unknown.',
        start,
      );
    }
  },
};

export const webShareCheck: ApiCheck = {
  id: 'web-share',
  name: 'Web Share API',
  category: 'file_clipboard',
  description: 'Share content using the native OS share dialog.',
  weight: 4,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: 'partial' },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('share' in navigator)) {
      return makeResult(
        webShareCheck,
        'not_supported',
        'Web Share API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        webShareCheck,
        'https_required',
        'Web Share API requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(webShareCheck, 'supported', 'Web Share API is available.', start);
  },
};

export const webShareTargetCheck: ApiCheck = {
  id: 'web-share-target',
  name: 'Web Share Target',
  category: 'file_clipboard',
  description: 'Register the PWA to receive shared content from other apps.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/Manifest/share_target',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    const navShare = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
    if (!('canShare' in navigator) || typeof navShare.canShare !== 'function') {
      return makeResult(
        webShareTargetCheck,
        'not_supported',
        'Web Share Target API (canShare) is not available in this browser.',
        start,
      );
    }
    return makeResult(
      webShareTargetCheck,
      'supported',
      'Web Share Target API is available.',
      start,
    );
  },
};

export const fileClipboardChecks: ApiCheck[] = [
  fileSystemAccessCheck,
  fileHandlingCheck,
  clipboardApiCheck,
  clipboardReadCheck,
  webShareCheck,
  webShareTargetCheck,
];
