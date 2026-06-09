'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, Music, Camera, Play, Tv, Grid, Circle, Check } from 'lucide-react';

export interface OutputFormat {
  id: string;
  name: string;
  platform: string;
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  maxDuration: number;
  resolution: { width: number; height: number };
  icon: LucideIcon;
}

export const OUTPUT_FORMATS: OutputFormat[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    platform: 'TikTok',
    aspectRatio: '9:16',
    maxDuration: 180,
    resolution: { width: 1080, height: 1920 },
    icon: Music,
  },
  {
    id: 'reels',
    name: 'Instagram Reels',
    platform: 'Instagram',
    aspectRatio: '9:16',
    maxDuration: 90,
    resolution: { width: 1080, height: 1920 },
    icon: Camera,
  },
  {
    id: 'shorts',
    name: 'YouTube Shorts',
    platform: 'YouTube',
    aspectRatio: '9:16',
    maxDuration: 60,
    resolution: { width: 1080, height: 1920 },
    icon: Play,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    platform: 'YouTube',
    aspectRatio: '16:9',
    maxDuration: 600,
    resolution: { width: 1920, height: 1080 },
    icon: Tv,
  },
  {
    id: 'instagram-feed',
    name: 'Instagram Feed',
    platform: 'Instagram',
    aspectRatio: '1:1',
    maxDuration: 60,
    resolution: { width: 1080, height: 1080 },
    icon: Grid,
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    platform: 'Instagram',
    aspectRatio: '9:16',
    maxDuration: 15,
    resolution: { width: 1080, height: 1920 },
    icon: Circle,
  },
];

interface FormatSelectorProps {
  selectedFormats: string[];
  onSelectionChange: (formats: string[]) => void;
  multiple?: boolean;
}

export function FormatSelector({
  selectedFormats,
  onSelectionChange,
  multiple = true,
}: FormatSelectorProps) {
  const handleFormatClick = (formatId: string) => {
    if (multiple) {
      if (selectedFormats.includes(formatId)) {
        onSelectionChange(selectedFormats.filter(id => id !== formatId));
      } else {
        onSelectionChange([...selectedFormats, formatId]);
      }
    } else {
      onSelectionChange([formatId]);
    }
  };

  const verticalFormats = OUTPUT_FORMATS.filter(f => f.aspectRatio === '9:16');
  const otherFormats = OUTPUT_FORMATS.filter(f => f.aspectRatio !== '9:16');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Formatos Verticales (9:16)</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {verticalFormats.map(format => (
            <FormatCard
              key={format.id}
              format={format}
              isSelected={selectedFormats.includes(format.id)}
              onClick={() => handleFormatClick(format.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Otros Formatos</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {otherFormats.map(format => (
            <FormatCard
              key={format.id}
              format={format}
              isSelected={selectedFormats.includes(format.id)}
              onClick={() => handleFormatClick(format.id)}
            />
          ))}
        </div>
      </div>

      {selectedFormats.length > 0 && (
        <div className="rounded-md bg-zinc-800/50 p-3 text-sm text-zinc-400">
          <span className="font-medium text-white">{selectedFormats.length}</span> formato
          {selectedFormats.length !== 1 ? 's' : ''} seleccionado
          {selectedFormats.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

interface FormatCardProps {
  format: OutputFormat;
  isSelected: boolean;
  onClick: () => void;
}

function FormatCard({ format, isSelected, onClick }: FormatCardProps) {
  const Icon = format.icon;
  const durationText =
    format.maxDuration >= 60
      ? `${Math.floor(format.maxDuration / 60)} min`
      : `${format.maxDuration} seg`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex items-start gap-4 rounded-lg border p-5 text-left transition-all duration-200',
        isSelected
          ? 'border-violet-500/50 bg-violet-500/5'
          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/50'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
          isSelected ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-800 text-zinc-400'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-white">{format.name}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-500">
            {format.aspectRatio}
          </span>
          <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-500">
            {durationText}
          </span>
        </div>
      </div>

      <div
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all',
          isSelected
            ? 'border-violet-500 bg-violet-500'
            : 'border-zinc-700 bg-transparent group-hover:border-zinc-600'
        )}
      >
        {isSelected && <Check className="h-3 w-3 text-white" />}
      </div>
    </button>
  );
}
