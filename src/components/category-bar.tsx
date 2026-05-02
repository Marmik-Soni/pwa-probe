import type { CategoryScore } from '@/engine/types';
import { getScoreColor } from '@/lib/tier-config';
import { cn } from '@/lib/utils';

interface CategoryBarProps {
  score: CategoryScore;
  className?: string;
}

export function CategoryBar({ score: categoryScore, className }: CategoryBarProps) {
  const color = getScoreColor(categoryScore.score);

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground font-medium">{categoryScore.label}</span>
        <span className="text-muted-foreground">
          {categoryScore.checks_passed}/{categoryScore.checks_total}
        </span>
      </div>
      <div
        className="bg-muted h-1.5 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={categoryScore.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${categoryScore.label}: ${categoryScore.score}%`}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${categoryScore.score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
