'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, Zap, Music, Star, Laugh, Check } from 'lucide-react';
import { VIDEO_INTENTS, type VideoIntent } from '@/lib/constants';

const ICON_MAP: Record<VideoIntent['iconName'], LucideIcon> = {
  Zap,
  Music,
  Star,
  Laugh,
};

interface IntentSelectorProps {
  selectedIntent: string | null;
  onSelectionChange: (intent: string) => void;
}

export function IntentSelector({ selectedIntent, onSelectionChange }: IntentSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {VIDEO_INTENTS.map(intent => (
        <IntentCard
          key={intent.id}
          intent={intent}
          isSelected={selectedIntent === intent.id}
          onClick={() => onSelectionChange(intent.id)}
        />
      ))}
    </div>
  );
}

interface IntentCardProps {
  intent: VideoIntent;
  isSelected: boolean;
  onClick: () => void;
}

function IntentCard({ intent, isSelected, onClick }: IntentCardProps) {
  const Icon = ICON_MAP[intent.iconName];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col rounded-xl border p-5 text-left transition-all duration-200',
        isSelected
          ? 'border-violet-500/50 bg-violet-500/5'
          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/50'
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
            isSelected ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-800 text-zinc-400'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-full border transition-all',
            isSelected
              ? 'border-violet-500 bg-violet-500'
              : 'border-zinc-700 bg-transparent group-hover:border-zinc-600'
          )}
        >
          {isSelected && <Check className="h-3 w-3 text-white" />}
        </div>
      </div>

      <div className="mt-4">
        <p className="font-medium text-white">{intent.name}</p>
        <p className="mt-1 text-sm text-zinc-500">{intent.description}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {intent.examples.map(example => (
          <span
            key={example}
            className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-500"
          >
            {example}
          </span>
        ))}
      </div>
    </button>
  );
}
