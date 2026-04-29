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

export const paymentRequestCheck: ApiCheck = {
  id: 'payment-request',
  name: 'Payment Request API',
  category: 'payments_contacts',
  description: 'Native payment UI using saved payment methods.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('PaymentRequest' in window)) {
      return makeResult(
        paymentRequestCheck,
        'not_supported',
        'Payment Request API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        paymentRequestCheck,
        'https_required',
        'Payment Request API requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(paymentRequestCheck, 'supported', 'Payment Request API is available.', start);
  },
};

export const contactPickerCheck: ApiCheck = {
  id: 'contact-picker',
  name: 'Contact Picker API',
  category: 'payments_contacts',
  description: 'Allow users to select contacts from their device address book.',
  weight: 2,
  stage: 2,
  known_support: { blink: 'partial', webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Contact_Picker_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    const nav = navigator as Navigator & { contacts?: unknown };
    if (!('contacts' in navigator) || !nav.contacts) {
      return makeResult(
        contactPickerCheck,
        'not_supported',
        'Contact Picker API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        contactPickerCheck,
        'https_required',
        'Contact Picker API requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(contactPickerCheck, 'supported', 'Contact Picker API is available.', start);
  },
};

export const wakeLockCheck: ApiCheck = {
  id: 'wake-lock',
  name: 'Wake Lock API',
  category: 'payments_contacts',
  description: 'Prevent the screen from dimming or locking.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('wakeLock' in navigator)) {
      return makeResult(
        wakeLockCheck,
        'not_supported',
        'Wake Lock API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        wakeLockCheck,
        'https_required',
        'Wake Lock API requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(wakeLockCheck, 'supported', 'Wake Lock API is available.', start);
  },
};

export const screenOrientationCheck: ApiCheck = {
  id: 'screen-orientation',
  name: 'Screen Orientation API',
  category: 'payments_contacts',
  description: 'Read and lock the screen orientation.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: 'partial', gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('orientation' in screen)) {
      return makeResult(
        screenOrientationCheck,
        'not_supported',
        'Screen Orientation API is not available in this browser.',
        start,
      );
    }
    return makeResult(
      screenOrientationCheck,
      'supported',
      'Screen Orientation API is available.',
      start,
    );
  },
};

export const paymentsContactsChecks: ApiCheck[] = [
  paymentRequestCheck,
  contactPickerCheck,
  wakeLockCheck,
  screenOrientationCheck,
];
