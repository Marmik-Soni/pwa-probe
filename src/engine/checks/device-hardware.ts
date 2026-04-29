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

export const webBluetoothCheck: ApiCheck = {
  id: 'web-bluetooth',
  name: 'Web Bluetooth',
  category: 'device_hardware',
  description: 'Communicate with Bluetooth Low Energy devices.',
  weight: 3,
  stage: 2,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('bluetooth' in navigator)) {
      return makeResult(
        webBluetoothCheck,
        'not_supported',
        'Web Bluetooth API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        webBluetoothCheck,
        'https_required',
        'Web Bluetooth requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(webBluetoothCheck, 'supported', 'Web Bluetooth API is available.', start);
  },
};

export const webNfcCheck: ApiCheck = {
  id: 'web-nfc',
  name: 'Web NFC',
  category: 'device_hardware',
  description: 'Read and write NFC tags.',
  weight: 2,
  stage: 1,
  known_support: { blink: 'partial', webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_NFC_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('NDEFReader' in window)) {
      return makeResult(
        webNfcCheck,
        'not_supported',
        'Web NFC API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        webNfcCheck,
        'https_required',
        'Web NFC requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(webNfcCheck, 'supported', 'Web NFC API is available.', start);
  },
};

export const webUsbCheck: ApiCheck = {
  id: 'web-usb',
  name: 'Web USB',
  category: 'device_hardware',
  description: 'Communicate with USB devices.',
  weight: 2,
  stage: 2,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('usb' in navigator)) {
      return makeResult(
        webUsbCheck,
        'not_supported',
        'Web USB API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        webUsbCheck,
        'https_required',
        'Web USB requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(webUsbCheck, 'supported', 'Web USB API is available.', start);
  },
};

export const webSerialCheck: ApiCheck = {
  id: 'web-serial',
  name: 'Web Serial',
  category: 'device_hardware',
  description: 'Communicate with serial devices (Arduino, etc.).',
  weight: 2,
  stage: 2,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('serial' in navigator)) {
      return makeResult(
        webSerialCheck,
        'not_supported',
        'Web Serial API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        webSerialCheck,
        'https_required',
        'Web Serial requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(webSerialCheck, 'supported', 'Web Serial API is available.', start);
  },
};

export const webHidCheck: ApiCheck = {
  id: 'web-hid',
  name: 'WebHID',
  category: 'device_hardware',
  description: 'Access HID (Human Interface Device) peripherals.',
  weight: 2,
  stage: 2,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('hid' in navigator)) {
      return makeResult(
        webHidCheck,
        'not_supported',
        'WebHID API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        webHidCheck,
        'https_required',
        'WebHID requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(webHidCheck, 'supported', 'WebHID API is available.', start);
  },
};

export const vibrationApiCheck: ApiCheck = {
  id: 'vibration-api',
  name: 'Vibration API',
  category: 'device_hardware',
  description: 'Trigger device vibration for haptic feedback.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('vibrate' in navigator)) {
      return makeResult(
        vibrationApiCheck,
        'not_supported',
        'Vibration API is not available in this browser.',
        start,
      );
    }
    return makeResult(vibrationApiCheck, 'supported', 'Vibration API is available.', start);
  },
};

export const batteryApiCheck: ApiCheck = {
  id: 'battery-api',
  name: 'Battery Status API',
  category: 'device_hardware',
  description: 'Read battery level and charging status.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: 'partial' },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    const nav = navigator as Navigator & { getBattery?: () => Promise<unknown> };
    if (typeof nav.getBattery !== 'function') {
      return makeResult(
        batteryApiCheck,
        'not_supported',
        'Battery Status API is not available in this browser.',
        start,
      );
    }
    return makeResult(batteryApiCheck, 'supported', 'Battery Status API is available.', start);
  },
};

export const geolocationCheck: ApiCheck = {
  id: 'geolocation',
  name: 'Geolocation API',
  category: 'device_hardware',
  description: "Access the device's GPS/location data.",
  weight: 4,
  stage: 1,
  requires_permission: 'geolocation',
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('geolocation' in navigator)) {
      return makeResult(
        geolocationCheck,
        'not_supported',
        'Geolocation API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        geolocationCheck,
        'https_required',
        'Geolocation API requires a secure context (HTTPS).',
        start,
      );
    }
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      if (result.state === 'granted') {
        return makeResult(
          geolocationCheck,
          'supported',
          'Geolocation API is available and permission is granted.',
          start,
          result.state,
        );
      }
      if (result.state === 'denied') {
        return makeResult(
          geolocationCheck,
          'permission_denied',
          'Geolocation permission was denied.',
          start,
          result.state,
        );
      }
      return makeResult(
        geolocationCheck,
        'not_tested',
        'Geolocation API is available — permission not yet requested.',
        start,
        result.state,
      );
    } catch {
      return makeResult(
        geolocationCheck,
        'not_tested',
        'Geolocation API is available — permission state unknown.',
        start,
      );
    }
  },
};

export const deviceHardwareChecks: ApiCheck[] = [
  webBluetoothCheck,
  webNfcCheck,
  webUsbCheck,
  webSerialCheck,
  webHidCheck,
  vibrationApiCheck,
  batteryApiCheck,
  geolocationCheck,
];
