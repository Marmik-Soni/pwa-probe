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

export const speechRecognitionCheck: ApiCheck = {
  id: 'speech-recognition',
  name: 'Speech Recognition',
  category: 'speech_ai',
  description: 'Convert spoken audio to text in real time.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    const w = window as Window & { webkitSpeechRecognition?: unknown; SpeechRecognition?: unknown };
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      return makeResult(
        speechRecognitionCheck,
        'not_supported',
        'Speech Recognition API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        speechRecognitionCheck,
        'https_required',
        'Speech Recognition requires a secure context (HTTPS).',
        start,
      );
    }
    if (!w.SpeechRecognition && w.webkitSpeechRecognition) {
      return makeResult(
        speechRecognitionCheck,
        'partial',
        'Speech Recognition is available via webkit prefix only.',
        start,
      );
    }
    return makeResult(
      speechRecognitionCheck,
      'supported',
      'Speech Recognition API is available.',
      start,
    );
  },
};

export const speechSynthesisCheck: ApiCheck = {
  id: 'speech-synthesis',
  name: 'Speech Synthesis (TTS)',
  category: 'speech_ai',
  description: 'Convert text to speech using the Web Speech API.',
  weight: 2,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('speechSynthesis' in window)) {
      return makeResult(
        speechSynthesisCheck,
        'not_supported',
        'Speech Synthesis API is not available in this browser.',
        start,
      );
    }
    return makeResult(
      speechSynthesisCheck,
      'supported',
      'Speech Synthesis API is available.',
      start,
    );
  },
};

export const idleDetectorCheck: ApiCheck = {
  id: 'idle-detector',
  name: 'Idle Detector API',
  category: 'speech_ai',
  description: 'Detect when the user is idle (no interaction for a period).',
  weight: 2,
  stage: 1,
  requires_permission: 'idle-detection',
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Idle_Detection_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('IdleDetector' in window)) {
      return makeResult(
        idleDetectorCheck,
        'not_supported',
        'Idle Detector API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        idleDetectorCheck,
        'https_required',
        'Idle Detector requires a secure context (HTTPS).',
        start,
      );
    }
    try {
      const result = await navigator.permissions.query({
        name: 'idle-detection' as PermissionName,
      });
      if (result.state === 'granted') {
        return makeResult(
          idleDetectorCheck,
          'supported',
          'Idle Detector API is available and permission is granted.',
          start,
          result.state,
        );
      }
      if (result.state === 'denied') {
        return makeResult(
          idleDetectorCheck,
          'permission_denied',
          'Idle Detection permission was denied.',
          start,
          result.state,
        );
      }
      return makeResult(
        idleDetectorCheck,
        'not_tested',
        'Idle Detector API is available — permission not yet requested.',
        start,
        result.state,
      );
    } catch {
      return makeResult(
        idleDetectorCheck,
        'not_tested',
        'Idle Detector API is available — permission state unknown.',
        start,
      );
    }
  },
};

export const eyeDropperCheck: ApiCheck = {
  id: 'eye-dropper',
  name: 'EyeDropper API',
  category: 'speech_ai',
  description: 'Pick a color from anywhere on the screen.',
  weight: 1,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('EyeDropper' in window)) {
      return makeResult(
        eyeDropperCheck,
        'not_supported',
        'EyeDropper API is not available in this browser.',
        start,
      );
    }
    return makeResult(eyeDropperCheck, 'supported', 'EyeDropper API is available.', start);
  },
};

export const chromeAiCheck: ApiCheck = {
  id: 'chrome-ai',
  name: 'Chrome Built-in AI',
  category: 'speech_ai',
  description: 'Access on-device AI models (Gemini Nano) built into the browser.',
  weight: 2,
  stage: 1,
  known_support: { blink: 'partial', webkit: false, gecko: false },
  mdn_url: 'https://developer.chrome.com/docs/ai/built-in',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    const w = window as Window & { ai?: unknown };
    if (!('ai' in window) || !w.ai) {
      return makeResult(
        chromeAiCheck,
        'not_supported',
        'Chrome Built-in AI (window.ai) is not available in this browser.',
        start,
      );
    }
    return makeResult(chromeAiCheck, 'supported', 'Chrome Built-in AI API is available.', start);
  },
};

export const chromeAiLanguageModelCheck: ApiCheck = {
  id: 'chrome-ai-language-model',
  name: 'Chrome AI Language Model',
  category: 'speech_ai',
  description: 'Access the on-device Gemini Nano language model API.',
  weight: 2,
  stage: 1,
  known_support: { blink: 'partial', webkit: false, gecko: false },
  mdn_url: 'https://developer.chrome.com/docs/ai/built-in',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    const w = window as Window & { ai?: { languageModel?: unknown } };
    if (!w.ai?.languageModel) {
      return makeResult(
        chromeAiLanguageModelCheck,
        'not_supported',
        'Chrome AI Language Model (window.ai.languageModel) is not available.',
        start,
      );
    }
    return makeResult(
      chromeAiLanguageModelCheck,
      'supported',
      'Chrome AI Language Model API is available.',
      start,
    );
  },
};

export const speechAiChecks: ApiCheck[] = [
  speechRecognitionCheck,
  speechSynthesisCheck,
  idleDetectorCheck,
  eyeDropperCheck,
  chromeAiCheck,
  chromeAiLanguageModelCheck,
];
