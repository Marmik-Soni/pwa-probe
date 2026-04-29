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

export const notificationApiCheck: ApiCheck = {
  id: 'notification-api',
  name: 'Notifications API',
  category: 'push_notifications',
  description: 'Display system notifications outside of the page.',
  weight: 4,
  stage: 1,
  requires_permission: 'notifications',
  known_support: { blink: true, webkit: 'partial', gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('Notification' in window)) {
      return makeResult(
        notificationApiCheck,
        'not_supported',
        'Notifications API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        notificationApiCheck,
        'https_required',
        'Notifications API requires a secure context (HTTPS).',
        start,
      );
    }
    try {
      const result = await navigator.permissions.query({ name: 'notifications' });
      if (result.state === 'granted') {
        return makeResult(
          notificationApiCheck,
          'supported',
          'Notifications API is available and permission is granted.',
          start,
          result.state,
        );
      }
      if (result.state === 'denied') {
        return makeResult(
          notificationApiCheck,
          'permission_denied',
          'Notification permission was denied.',
          start,
          result.state,
        );
      }
      return makeResult(
        notificationApiCheck,
        'not_tested',
        'Notifications API is available — permission not yet requested.',
        start,
        result.state,
      );
    } catch {
      return makeResult(
        notificationApiCheck,
        'not_tested',
        'Notifications API is available — permission state unknown.',
        start,
      );
    }
  },
};

export const pushManagerCheck: ApiCheck = {
  id: 'push-manager',
  name: 'Push API',
  category: 'push_notifications',
  description: 'Receive server-sent messages even when the app is not open.',
  weight: 4,
  stage: 1,
  known_support: { blink: true, webkit: 'partial', gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Push_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('PushManager' in window)) {
      return makeResult(
        pushManagerCheck,
        'not_supported',
        'Push API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        pushManagerCheck,
        'https_required',
        'Push API requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(pushManagerCheck, 'supported', 'Push API is available.', start);
  },
};

export const badgingApiCheck: ApiCheck = {
  id: 'badging-api',
  name: 'Badging API',
  category: 'push_notifications',
  description: 'Set a badge on the app icon to indicate unread notifications.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Badging_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('setAppBadge' in navigator)) {
      return makeResult(
        badgingApiCheck,
        'not_supported',
        'Badging API (navigator.setAppBadge) is not available in this browser.',
        start,
      );
    }
    return makeResult(badgingApiCheck, 'supported', 'Badging API is available.', start);
  },
};

export const iosPushCheck: ApiCheck = {
  id: 'ios-push-pwa',
  name: 'iOS Push (PWA only)',
  category: 'push_notifications',
  description: 'iOS Safari supports push notifications only when installed as a PWA.',
  weight: 2,
  stage: 1,
  known_support: { blink: false, webkit: 'partial', gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Push_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/chrome/i.test(ua);
    if (!isIos || !isSafari) {
      return makeResult(
        iosPushCheck,
        'not_tested',
        'iOS Safari push check is only relevant on iOS Safari.',
        start,
      );
    }
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if ('PushManager' in window && isStandalone) {
      return makeResult(
        iosPushCheck,
        'supported',
        'iOS PWA push notifications are available (running as installed PWA).',
        start,
      );
    }
    if ('PushManager' in window && !isStandalone) {
      return makeResult(
        iosPushCheck,
        'partial',
        'iOS Safari supports push only when the PWA is installed to the home screen.',
        start,
      );
    }
    return makeResult(
      iosPushCheck,
      'not_supported',
      'Push notifications are not available on this iOS browser.',
      start,
    );
  },
};

export const pushNotificationChecks: ApiCheck[] = [
  notificationApiCheck,
  pushManagerCheck,
  badgingApiCheck,
  iosPushCheck,
];
