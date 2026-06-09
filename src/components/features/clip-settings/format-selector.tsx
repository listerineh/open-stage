'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, Music, Camera, Play, Tv, Grid, Circle, Check } from 'lucide-react';
import { OUTPUT_FORMATS, type OutputFormat } from '@/lib/constants';

const ICON_MAP: Record<OutputFormat['iconName'], LucideIcon> = {
  Music,
  Camera,
  Play,
  Tv,
  Grid,
  Circle,
};

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
  const Icon = ICON_MAP[format.iconName];
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
