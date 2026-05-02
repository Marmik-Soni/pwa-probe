'use client';

import { useEffect, useRef } from 'react';

import type { ScoreTier } from '@/engine/types';
import { TIER_CONFIG } from '@/lib/tier-config';
import { cn } from '@/lib/utils';

interface ScoreRingProps {
  score: number;
  tier: ScoreTier;
  /** Diameter of the ring in px. Defaults to 128. */
  size?: number;
  className?: string;
}

const STROKE_WIDTH = 8;

export function ScoreRing({ score, tier, size = 128, className }: ScoreRingProps) {
  const center = size / 2;
  const radius = center - STROKE_WIDTH;
  const circumference = 2 * Math.PI * radius;
  const arcRef = useRef<SVGCircleElement>(null);
  const { color, label } = TIER_CONFIG[tier];

  // Animate the arc by mutating the DOM element directly — no useState needed.
  // This is the correct use of useEffect: synchronising a DOM node with React state.
  useEffect(() => {
    if (!arcRef.current) return;
    arcRef.current.style.strokeDashoffset = String(circumference * (1 - score / 100));
  }, [score, circumference]);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} role="img" aria-label={`PWA score: ${score} — ${label}`}>
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={STROKE_WIDTH}
        />
        {/* Score arc — starts empty (dashoffset = circumference), animates via ref */}
        <circle
          ref={arcRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>

      {/* Centred label overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl leading-none font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-muted-foreground mt-1 text-center text-[10px] leading-tight">
          {label}
        </span>
      </div>
    </div>
  );
}
