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

export const deviceOrientationCheck: ApiCheck = {
  id: 'device-orientation',
  name: 'Device Orientation',
  category: 'sensors_motion',
  description: 'Get physical orientation of the device (alpha, beta, gamma).',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('DeviceOrientationEvent' in window)) {
      return makeResult(
        deviceOrientationCheck,
        'not_supported',
        'DeviceOrientationEvent is not available in this browser.',
        start,
      );
    }
    return makeResult(
      deviceOrientationCheck,
      'supported',
      'DeviceOrientationEvent is available.',
      start,
    );
  },
};

export const deviceMotionCheck: ApiCheck = {
  id: 'device-motion',
  name: 'Device Motion',
  category: 'sensors_motion',
  description: 'Detect physical movement via accelerometer and gyroscope events.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('DeviceMotionEvent' in window)) {
      return makeResult(
        deviceMotionCheck,
        'not_supported',
        'DeviceMotionEvent is not available in this browser.',
        start,
      );
    }
    return makeResult(deviceMotionCheck, 'supported', 'DeviceMotionEvent is available.', start);
  },
};

export const gyroscopeCheck: ApiCheck = {
  id: 'gyroscope',
  name: 'Gyroscope',
  category: 'sensors_motion',
  description: 'Read rotation rate via the Generic Sensor API.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Gyroscope',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('Gyroscope' in window)) {
      return makeResult(
        gyroscopeCheck,
        'not_supported',
        'Gyroscope sensor API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        gyroscopeCheck,
        'https_required',
        'Gyroscope requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(gyroscopeCheck, 'supported', 'Gyroscope sensor API is available.', start);
  },
};

export const accelerometerCheck: ApiCheck = {
  id: 'accelerometer',
  name: 'Accelerometer',
  category: 'sensors_motion',
  description: 'Read acceleration forces via the Generic Sensor API.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Accelerometer',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('Accelerometer' in window)) {
      return makeResult(
        accelerometerCheck,
        'not_supported',
        'Accelerometer sensor API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        accelerometerCheck,
        'https_required',
        'Accelerometer requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(
      accelerometerCheck,
      'supported',
      'Accelerometer sensor API is available.',
      start,
    );
  },
};

export const magnetometerCheck: ApiCheck = {
  id: 'magnetometer',
  name: 'Magnetometer',
  category: 'sensors_motion',
  description: 'Read magnetic field data (compass) via the Generic Sensor API.',
  weight: 1,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Magnetometer',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('Magnetometer' in window)) {
      return makeResult(
        magnetometerCheck,
        'not_supported',
        'Magnetometer sensor API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        magnetometerCheck,
        'https_required',
        'Magnetometer requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(
      magnetometerCheck,
      'supported',
      'Magnetometer sensor API is available.',
      start,
    );
  },
};

export const ambientLightSensorCheck: ApiCheck = {
  id: 'ambient-light-sensor',
  name: 'Ambient Light Sensor',
  category: 'sensors_motion',
  description: 'Read the ambient light level of the device environment.',
  weight: 1,
  stage: 1,
  known_support: { blink: 'partial', webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/AmbientLightSensor',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('AmbientLightSensor' in window)) {
      return makeResult(
        ambientLightSensorCheck,
        'not_supported',
        'Ambient Light Sensor API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        ambientLightSensorCheck,
        'https_required',
        'Ambient Light Sensor requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(
      ambientLightSensorCheck,
      'supported',
      'Ambient Light Sensor API is available.',
      start,
    );
  },
};

export const proximitySensorCheck: ApiCheck = {
  id: 'proximity-sensor',
  name: 'Proximity Sensor',
  category: 'sensors_motion',
  description: "Detect how close the user's hand or face is to the device.",
  weight: 1,
  stage: 1,
  known_support: { blink: false, webkit: false, gecko: 'partial' },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Proximity_Events',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('ProximitySensor' in window)) {
      return makeResult(
        proximitySensorCheck,
        'not_supported',
        'Proximity Sensor API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        proximitySensorCheck,
        'https_required',
        'Proximity Sensor requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(
      proximitySensorCheck,
      'supported',
      'Proximity Sensor API is available.',
      start,
    );
  },
};

export const sensorsMotionChecks: ApiCheck[] = [
  deviceOrientationCheck,
  deviceMotionCheck,
  gyroscopeCheck,
  accelerometerCheck,
  magnetometerCheck,
  ambientLightSensorCheck,
  proximitySensorCheck,
];
