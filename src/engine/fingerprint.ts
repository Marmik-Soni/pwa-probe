import type {
  BrowserContext,
  BrowserEngine,
  BrowserName,
  DeviceContext,
  FormFactor,
  Platform,
} from './types';

export function detectDevice(): DeviceContext {
  const ua = navigator.userAgent;
  const platform = detectPlatform(ua);
  const form_factor = detectFormFactor(ua);

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { type?: string; effectiveType?: string };
  };

  return {
    platform,
    form_factor,
    cpu_cores: navigator.hardwareConcurrency ?? null,
    memory_gb: nav.deviceMemory ?? null,
    screen_w: window.screen.width,
    screen_h: window.screen.height,
    pixel_ratio: window.devicePixelRatio,
    touch_points: navigator.maxTouchPoints,
    connection_type: nav.connection?.effectiveType ?? nav.connection?.type ?? null,
    is_standalone:
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone === true),
  };
}

export function detectBrowser(): BrowserContext {
  const ua = navigator.userAgent;
  const { name, version } = detectBrowserNameVersion(ua);
  const { engine, engine_version } = detectEngine(ua);

  const nav = navigator as Navigator & {
    userAgentData?: {
      brands?: Array<{ brand: string; version: string }>;
      platform?: string;
      mobile?: boolean;
    };
  };

  let ua_data: Record<string, string> | null = null;
  if (nav.userAgentData) {
    ua_data = {
      platform: nav.userAgentData.platform ?? '',
      mobile: String(nav.userAgentData.mobile ?? false),
    };
    if (nav.userAgentData.brands) {
      nav.userAgentData.brands.forEach((b) => {
        if (ua_data && b.brand && !b.brand.includes('Not')) {
          ua_data[b.brand] = b.version;
        }
      });
    }
  }

  return {
    name,
    version,
    engine,
    engine_version,
    is_secure_context: window.isSecureContext,
    is_cross_origin_isolated: window.crossOriginIsolated,
    language: navigator.language,
    ua_raw: ua,
    ua_data,
  };
}

function detectPlatform(ua: string): Platform {
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/windows/i.test(ua)) return 'windows';
  if (/macintosh|mac os x/i.test(ua)) return 'macos';
  if (/linux/i.test(ua)) return 'linux';
  return 'unknown';
}

function detectFormFactor(ua: string): FormFactor {
  if (/ipad|tablet|kindle/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android.*mobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

function detectBrowserNameVersion(ua: string): { name: BrowserName; version: string } {
  // Order matters — more specific first
  if (/brave/i.test(ua)) return { name: 'brave', version: extractVersion(ua, /brave\/([\d.]+)/i) };
  if (/samsungbrowser/i.test(ua))
    return { name: 'samsung', version: extractVersion(ua, /samsungbrowser\/([\d.]+)/i) };
  if (/opr\//i.test(ua)) return { name: 'opera', version: extractVersion(ua, /opr\/([\d.]+)/i) };
  if (/edg\//i.test(ua)) return { name: 'edge', version: extractVersion(ua, /edg\/([\d.]+)/i) };
  if (/chrome/i.test(ua))
    return { name: 'chrome', version: extractVersion(ua, /chrome\/([\d.]+)/i) };
  if (/firefox/i.test(ua))
    return { name: 'firefox', version: extractVersion(ua, /firefox\/([\d.]+)/i) };
  if (/safari/i.test(ua))
    return { name: 'safari', version: extractVersion(ua, /version\/([\d.]+)/i) };
  return { name: 'unknown', version: '' };
}

function detectEngine(ua: string): { engine: BrowserEngine; engine_version: string } {
  if (/gecko\//i.test(ua) && /firefox/i.test(ua)) {
    return { engine: 'gecko', engine_version: extractVersion(ua, /gecko\/([\d.]+)/i) };
  }
  if (/applewebkit/i.test(ua) && !/chrome/i.test(ua)) {
    return { engine: 'webkit', engine_version: extractVersion(ua, /applewebkit\/([\d.]+)/i) };
  }
  if (/chrome|chromium/i.test(ua)) {
    return { engine: 'blink', engine_version: extractVersion(ua, /chrome\/([\d.]+)/i) };
  }
  // Edge (Blink-based)
  if (/edg\//i.test(ua)) {
    return { engine: 'blink', engine_version: extractVersion(ua, /edg\/([\d.]+)/i) };
  }
  return { engine: 'unknown', engine_version: '' };
}

function extractVersion(ua: string, regex: RegExp): string {
  const match = regex.exec(ua);
  return match?.[1] ?? '';
}
