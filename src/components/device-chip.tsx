'use client';

import { type ComponentType, useSyncExternalStore } from 'react';
import { Globe, Monitor, Smartphone, Tablet } from 'lucide-react';

import { detectBrowser, detectDevice } from '@/engine/fingerprint';
import type { BrowserContext, DeviceContext } from '@/engine/types';
import { cn } from '@/lib/utils';

type Fingerprint = { device: DeviceContext; browser: BrowserContext };

const PLATFORM_LABEL: Record<DeviceContext['platform'], string> = {
  android: 'Android',
  ios: 'iOS',
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  unknown: 'Unknown',
};

const FORM_FACTOR_ICON: Record<
  DeviceContext['form_factor'],
  ComponentType<{ className?: string }>
> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

// Cache so getClientSnapshot is a stable reference and doesn't re-run detectDevice on every render
let _cached: Fingerprint | null = null;
function getClientSnapshot(): Fingerprint {
  _cached ??= { device: detectDevice(), browser: detectBrowser() };
  return _cached;
}
const noop = () => () => {}; // fingerprint never changes — no subscription needed

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function DeviceChip({ className }: { className?: string }) {
  // Returns null on the server (shows skeleton), real data on the client — no useEffect needed.
  const info = useSyncExternalStore(noop, getClientSnapshot, () => null);

  // Skeleton — matches pill size to prevent layout shift on hydration
  if (!info) {
    return <div className="bg-muted h-6 w-52 animate-pulse rounded-full" />;
  }

  const { device, browser } = info;
  const FormIcon = FORM_FACTOR_ICON[device.form_factor];
  const majorVersion = browser.version.split('.')[0];
  const browserLabel = `${capitalize(browser.name)} ${majorVersion}`;

  return (
    <div
      className={cn(
        'border-border bg-muted/40 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs',
        className,
      )}
    >
      <span className="inline-flex items-center gap-1">
        <FormIcon className="h-3 w-3" />
        {PLATFORM_LABEL[device.platform]}
      </span>
      <span className="text-border" aria-hidden>
        ·
      </span>
      <span className="inline-flex items-center gap-1">
        <Globe className="h-3 w-3" />
        {browserLabel}
      </span>
      <span className="text-border" aria-hidden>
        ·
      </span>
      <span className="capitalize">{device.form_factor}</span>
    </div>
  );
}
