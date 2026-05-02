import type { Advisory } from '@/engine/types';
import { cn } from '@/lib/utils';

interface AdvisoryCardProps {
  advisory: Advisory;
  className?: string;
}

interface SeverityConfig {
  color: string;
  label: string;
}

const SEVERITY_CONFIG: Record<Advisory['severity'], SeverityConfig> = {
  high: { color: 'var(--destructive)', label: 'High' },
  medium: { color: 'var(--chart-2)', label: 'Medium' },
  low: { color: 'var(--muted-foreground)', label: 'Low' },
};

export function AdvisoryCard({ advisory, className }: AdvisoryCardProps) {
  const { color, label } = SEVERITY_CONFIG[advisory.severity];

  return (
    <div className={cn('border-border bg-card space-y-2 rounded-lg border px-4 py-4', className)}>
      <div className="flex items-center gap-2">
        {/* Severity badge */}
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
          style={{
            color,
            backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
          }}
        >
          {label}
        </span>
        <span className="text-foreground text-sm font-medium">{advisory.title}</span>
      </div>

      <p className="text-muted-foreground text-xs">{advisory.description}</p>

      <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
        {advisory.action}
      </p>

      <p className="text-muted-foreground text-[10px]">
        Affects: <span className="font-mono">{advisory.affected_checks.join(', ')}</span>
      </p>
    </div>
  );
}
