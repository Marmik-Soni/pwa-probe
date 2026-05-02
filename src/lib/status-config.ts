import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Minus,
  ShieldOff,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

import type { CheckStatus } from '@/engine/types';

export interface StatusConfig {
  Icon: LucideIcon;
  /** CSS custom-property string, e.g. `var(--color-supported)` */
  color: string;
  /** Human-readable label */
  label: string;
}

export const STATUS_CONFIG: Record<CheckStatus, StatusConfig> = {
  supported: {
    Icon: CheckCircle2,
    color: 'var(--color-supported)',
    label: 'Supported',
  },
  partial: {
    Icon: AlertCircle,
    color: 'var(--chart-2)',
    label: 'Partial',
  },
  permission_denied: {
    Icon: ShieldOff,
    color: 'var(--color-permission-denied)',
    label: 'Permission Denied',
  },
  https_required: {
    Icon: Lock,
    color: 'var(--color-https-required)',
    label: 'HTTPS Required',
  },
  not_supported: {
    Icon: XCircle,
    color: 'var(--color-not-supported)',
    label: 'Not Supported',
  },
  not_tested: {
    Icon: Minus,
    color: 'var(--color-not-tested)',
    label: 'Not Tested',
  },
};
