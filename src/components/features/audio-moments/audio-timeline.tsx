'use client';

import { type AudioMoment, formatTimestamp } from '@/lib/audio';
import { cn } from '@/lib/utils';

interface AudioTimelineProps {
  moments: AudioMoment[];
  selectedMoments: number[];
  duration: number;
  onToggleMoment: (index: number) => void;
  className?: string;
}

export function AudioTimeline({
  moments,
  selectedMoments,
  duration,
  onToggleMoment,
  className,
}: AudioTimelineProps) {
  const getMomentColor = (type: AudioMoment['type'], isSelected: boolean) => {
    if (isSelected) return 'bg-violet-500 border-violet-400';

    switch (type) {
      case 'peak':
        return 'bg-violet-500/50 border-violet-400/50';
      case 'silence':
        return 'bg-blue-500/50 border-blue-400/50';
      case 'transition':
        return 'bg-emerald-500/50 border-emerald-400/50';
      default:
        return 'bg-zinc-500/50 border-zinc-400/50';
    }
  };

  return (
    <div className={cn('w-full max-w-full space-y-3', className)}>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>0:00</span>
        <span>Timeline</span>
        <span>{formatTimestamp(duration)}</span>
      </div>

      {/* Timeline bar */}
      <div className="relative h-12 w-full max-w-full rounded-lg border border-zinc-800 bg-zinc-900/50">
        {/* Background grid */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-zinc-800/50 last:border-r-0" />
          ))}
        </div>

        {/* Moments */}
        {moments.map((moment, index) => {
          const position = (moment.timestamp / duration) * 100;
          const isSelected = selectedMoments.includes(index);

          return (
            <button
              key={index}
              onClick={() => onToggleMoment(index)}
              className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${position}%` }}
              title={`${formatTimestamp(moment.timestamp)} - ${moment.type}`}
            >
              <div
                className={cn(
                  'h-8 w-1.5 rounded-full border-2 transition-all group-hover:h-10 group-hover:w-2',
                  getMomentColor(moment.type, isSelected)
                )}
              />
              {isSelected && (
                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-violet-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-violet-500" />
          <span className="text-zinc-500">Picos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-zinc-500">Silencios</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-zinc-500">Transiciones</span>
        </div>
      </div>
    </div>
  );
}
