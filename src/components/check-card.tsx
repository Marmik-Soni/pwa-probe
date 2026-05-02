'use client';

import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';

import type { CheckResult } from '@/engine/types';
import { STATUS_CONFIG } from '@/lib/status-config';
import { cn } from '@/lib/utils';

interface CheckCardProps {
  result: CheckResult;
  className?: string;
}

export function CheckCard({ result, className }: CheckCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { Icon, color, label } = STATUS_CONFIG[result.status];

  return (
    <div className={cn('border-border bg-card rounded-lg border', className)}>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        aria-expanded={expanded}
      >
        <Icon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
        <span className="text-foreground flex-1 text-sm font-medium">{result.name}</span>
        {/* Status badge — tinted background derived from the status colour */}
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            color,
            backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
          }}
        >
          {label}
        </span>
        <ChevronDown
          className={cn(
            'text-muted-foreground h-3.5 w-3.5 shrink-0 transition-transform duration-200',
            { 'rotate-180': expanded },
          )}
          aria-hidden
        />
      </button>

      {expanded && (
        <div className="border-border space-y-2 border-t px-4 pt-2 pb-3">
          {result.detail && <p className="text-muted-foreground text-xs">{result.detail}</p>}
          <div className="flex items-center justify-between">
            <a
              href={result.mdn_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
            >
              MDN docs
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
            <span className="text-muted-foreground font-mono text-[10px]">
              {result.duration_ms}ms
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
