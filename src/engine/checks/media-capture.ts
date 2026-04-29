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

export const mediaSessionCheck: ApiCheck = {
  id: 'media-session',
  name: 'Media Session API',
  category: 'media_capture',
  description: 'Customize media controls shown in OS notifications and lock screen.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('mediaSession' in navigator)) {
      return makeResult(
        mediaSessionCheck,
        'not_supported',
        'Media Session API is not available in this browser.',
        start,
      );
    }
    return makeResult(mediaSessionCheck, 'supported', 'Media Session API is available.', start);
  },
};

export const mediaRecorderCheck: ApiCheck = {
  id: 'media-recorder',
  name: 'MediaRecorder API',
  category: 'media_capture',
  description: 'Record audio and video streams from the device.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('MediaRecorder' in window)) {
      return makeResult(
        mediaRecorderCheck,
        'not_supported',
        'MediaRecorder API is not available in this browser.',
        start,
      );
    }
    return makeResult(mediaRecorderCheck, 'supported', 'MediaRecorder API is available.', start);
  },
};

export const screenCaptureCheck: ApiCheck = {
  id: 'screen-capture',
  name: 'Screen Capture API',
  category: 'media_capture',
  description: "Capture the user's screen or a specific window/tab.",
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('mediaDevices' in navigator) || !('getDisplayMedia' in navigator.mediaDevices)) {
      return makeResult(
        screenCaptureCheck,
        'not_supported',
        'Screen Capture API (getDisplayMedia) is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        screenCaptureCheck,
        'https_required',
        'Screen Capture requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(screenCaptureCheck, 'supported', 'Screen Capture API is available.', start);
  },
};

export const pictureInPictureCheck: ApiCheck = {
  id: 'picture-in-picture',
  name: 'Picture-in-Picture',
  category: 'media_capture',
  description: 'Float video in a persistent window over other apps.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('pictureInPictureEnabled' in document)) {
      return makeResult(
        pictureInPictureCheck,
        'not_supported',
        'Picture-in-Picture API is not available in this browser.',
        start,
      );
    }
    if (!document.pictureInPictureEnabled) {
      return makeResult(
        pictureInPictureCheck,
        'partial',
        'Picture-in-Picture API is present but disabled in this context.',
        start,
      );
    }
    return makeResult(
      pictureInPictureCheck,
      'supported',
      'Picture-in-Picture API is available.',
      start,
    );
  },
};

export const barcodeDetectorCheck: ApiCheck = {
  id: 'barcode-detector',
  name: 'Barcode Detector API',
  category: 'media_capture',
  description: 'Detect and decode barcodes and QR codes from images.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('BarcodeDetector' in window)) {
      return makeResult(
        barcodeDetectorCheck,
        'not_supported',
        'Barcode Detector API is not available in this browser.',
        start,
      );
    }
    return makeResult(
      barcodeDetectorCheck,
      'supported',
      'Barcode Detector API is available.',
      start,
    );
  },
};

export const faceDetectorCheck: ApiCheck = {
  id: 'face-detector',
  name: 'Face Detector API',
  category: 'media_capture',
  description: 'Detect human faces in images or video frames.',
  weight: 1,
  stage: 1,
  known_support: { blink: 'partial', webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/FaceDetector',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('FaceDetector' in window)) {
      return makeResult(
        faceDetectorCheck,
        'not_supported',
        'Face Detector API is not available in this browser.',
        start,
      );
    }
    return makeResult(faceDetectorCheck, 'supported', 'Face Detector API is available.', start);
  },
};

export const webXrCheck: ApiCheck = {
  id: 'webxr',
  name: 'WebXR Device API',
  category: 'media_capture',
  description: 'Access AR/VR hardware for immersive experiences.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: 'partial' },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('xr' in navigator)) {
      return makeResult(
        webXrCheck,
        'not_supported',
        'WebXR Device API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        webXrCheck,
        'https_required',
        'WebXR requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(webXrCheck, 'supported', 'WebXR Device API is available.', start);
  },
};

export const mediaCaptureChecks: ApiCheck[] = [
  mediaSessionCheck,
  mediaRecorderCheck,
  screenCaptureCheck,
  pictureInPictureCheck,
  barcodeDetectorCheck,
  faceDetectorCheck,
  webXrCheck,
];
