import type { Advisory, CheckResult } from './types';

interface AdvisoryRule {
  id: string;
  severity: Advisory['severity'];
  title: string;
  description: string;
  action: string;
  matches: (check: CheckResult) => boolean;
}

const ADVISORY_RULES: AdvisoryRule[] = [
  {
    id: 'no-https',
    severity: 'high',
    title: 'Site is not served over HTTPS',
    description:
      'HTTPS is required for most PWA features including service workers, push notifications, and geolocation. Without it, your PWA score is severely limited.',
    action:
      'Deploy your site with a valid TLS certificate. Most hosting providers (Vercel, Netlify, Cloudflare) provide this for free.',
    matches: (c) => c.id === 'https-detection' && c.status === 'not_supported',
  },
  {
    id: 'no-manifest',
    severity: 'high',
    title: 'No Web App Manifest found',
    description:
      'A Web App Manifest is required for your app to be installable and recognized as a PWA by browsers.',
    action:
      'Add a manifest.json file and link it in your <head> with <link rel="manifest" href="/manifest.json">.',
    matches: (c) => c.id === 'web-app-manifest' && c.status === 'not_supported',
  },
  {
    id: 'no-service-worker',
    severity: 'high',
    title: 'No Service Worker support',
    description:
      'Service Workers enable offline functionality, background sync, and push notifications. Without one, your app cannot function offline.',
    action: 'Register a service worker in your root scope. Use Workbox or a custom sw.js file.',
    matches: (c) => c.id === 'service-worker' && c.status === 'not_supported',
  },
  {
    id: 'no-indexeddb',
    severity: 'medium',
    title: 'IndexedDB is not available',
    description:
      'IndexedDB is the primary storage mechanism for offline PWAs. Many libraries (Dexie, idb) depend on it.',
    action:
      'Consider using a polyfill or alternative storage strategy for browsers without IndexedDB.',
    matches: (c) => c.id === 'indexed-db' && c.status === 'not_supported',
  },
  {
    id: 'no-cache-api',
    severity: 'high',
    title: 'Cache API is not available',
    description:
      'The Cache API is essential for service worker caching strategies. Without it, offline support is not possible.',
    action: 'Ensure you are serving the app over HTTPS. The Cache API requires a secure context.',
    matches: (c) =>
      c.id === 'cache-api' && (c.status === 'not_supported' || c.status === 'https_required'),
  },
  {
    id: 'permission-denied-notifications',
    severity: 'medium',
    title: 'Notification permission denied',
    description:
      'The user has blocked notifications for this site. Push notifications will not work.',
    action:
      'Guide users to reset notification permissions in browser settings (Settings > Privacy > Notifications).',
    matches: (c) => c.id === 'notification-api' && c.status === 'permission_denied',
  },
  {
    id: 'permission-denied-geolocation',
    severity: 'medium',
    title: 'Geolocation permission denied',
    description: 'The user has blocked location access for this site.',
    action:
      'Ask users to reset location permissions in browser settings or request permission again with clear context.',
    matches: (c) => c.id === 'geolocation' && c.status === 'permission_denied',
  },
  {
    id: 'no-install-prompt',
    severity: 'low',
    title: 'Custom install prompt not available',
    description:
      'beforeinstallprompt is not supported, so you cannot show a custom install button. Only Chromium-based browsers support this.',
    action:
      'Provide OS-level install instructions for non-Chromium browsers (e.g., Safari "Add to Home Screen" instructions).',
    matches: (c) => c.id === 'before-install-prompt' && c.status === 'not_supported',
  },
  {
    id: 'no-push-manager',
    severity: 'medium',
    title: 'Push API not available',
    description: 'Server-sent push notifications are not available in this browser.',
    action:
      'Push is available in Chrome, Firefox, and Edge. On Safari, it requires iOS 16.4+ and an installed PWA.',
    matches: (c) => c.id === 'push-manager' && c.status === 'not_supported',
  },
  {
    id: 'no-cross-origin-isolation',
    severity: 'low',
    title: 'Cross-origin isolation not enabled',
    description: 'SharedArrayBuffer and high-resolution timers require COOP and COEP headers.',
    action:
      'Set Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp headers on your server.',
    matches: (c) => c.id === 'cross-origin-isolated' && c.status === 'not_supported',
  },
];

export function generateAdvisories(checks: CheckResult[]): Advisory[] {
  const advisories: Advisory[] = [];

  for (const rule of ADVISORY_RULES) {
    const matchingChecks = checks.filter(rule.matches);
    if (matchingChecks.length > 0) {
      advisories.push({
        id: rule.id,
        severity: rule.severity,
        title: rule.title,
        description: rule.description,
        affected_checks: matchingChecks.map((c) => c.id),
        action: rule.action,
      });
    }
  }

  // Sort by severity
  const SEVERITY_ORDER: Record<Advisory['severity'], number> = { high: 0, medium: 1, low: 2 };
  advisories.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  return advisories;
}
