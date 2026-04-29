export type CheckStatus =
  | 'supported'
  | 'partial'
  | 'permission_denied'
  | 'https_required'
  | 'not_supported'
  | 'not_tested';

export type Platform = 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'unknown';
export type FormFactor = 'mobile' | 'tablet' | 'desktop';
export type BrowserEngine = 'blink' | 'webkit' | 'gecko' | 'unknown';
export type BrowserName =
  | 'chrome'
  | 'safari'
  | 'firefox'
  | 'edge'
  | 'samsung'
  | 'brave'
  | 'opera'
  | 'unknown';
export type ScanStage = 1 | 2 | 3;
export type ScoreTier = 'pwa_native' | 'pwa_ready' | 'pwa_capable' | 'web_only';

export interface DeviceContext {
  platform: Platform;
  form_factor: FormFactor;
  cpu_cores: number | null;
  memory_gb: number | null;
  screen_w: number;
  screen_h: number;
  pixel_ratio: number;
  touch_points: number;
  connection_type: string | null;
  is_standalone: boolean;
}

export interface BrowserContext {
  name: BrowserName;
  version: string;
  engine: BrowserEngine;
  engine_version: string;
  is_secure_context: boolean;
  is_cross_origin_isolated: boolean;
  language: string;
  ua_raw: string;
  ua_data: Record<string, string> | null;
}

export type CheckCategory =
  | 'installability'
  | 'service_worker'
  | 'storage'
  | 'push_notifications'
  | 'device_hardware'
  | 'file_clipboard'
  | 'identity_auth'
  | 'media_capture'
  | 'sensors_motion'
  | 'network_performance'
  | 'windowing_ui'
  | 'speech_ai'
  | 'payments_contacts'
  | 'secure_context';

export interface ApiCheck {
  id: string;
  name: string;
  category: CheckCategory;
  description: string;
  weight: number; // 1–5, used in scoring
  stage: ScanStage; // which stage runs this check
  requires_permission?: string; // Permissions API name if queryable
  known_support: Partial<Record<BrowserEngine, boolean | 'partial'>>;
  mdn_url: string;
  run: () => Promise<CheckResult>; // the actual detection function
}

export interface CheckResult {
  id: string;
  name: string;
  category: CheckCategory;
  weight: number;
  status: CheckStatus;
  detail: string | null; // human-readable explanation
  duration_ms: number;
  stage: ScanStage;
  permission_state: PermissionState | null;
  mdn_url: string;
  known_support: ApiCheck['known_support'];
}

export interface CategoryScore {
  category: CheckCategory;
  label: string;
  score: number; // 0–100
  checks_total: number;
  checks_passed: number;
}

export interface Advisory {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affected_checks: string[];
  action: string;
}

export interface ScanRecord {
  id: string;
  user_id: string | null;
  share_token: string;
  scanned_at: string; // ISO timestamp
  score: number;
  tier: ScoreTier;
  stage_reached: ScanStage;
  device: DeviceContext;
  browser: BrowserContext;
  checks: CheckResult[];
  category_scores: CategoryScore[];
  advisories: Advisory[];
}
