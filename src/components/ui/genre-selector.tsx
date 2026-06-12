'use client';

import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const GENRES = [
  'Rock',
  'Pop',
  'Metal',
  'Jazz',
  'Blues',
  'Reggae',
  'Hip Hop',
  'Electrónica',
  'Folk',
  'Indie',
  'Punk',
  'R&B',
  'Soul',
  'Country',
  'Clásica',
  'Latina',
  'Reggaeton',
  'Ska',
  'Funk',
  'Otro',
];

interface GenreSelectorProps {
  value: string[];
  onChange: (genres: string[]) => void;
  maxSelections?: number;
}

export function GenreSelector({ value, onChange, maxSelections = 5 }: GenreSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleGenre = (genre: string) => {
    if (value.includes(genre)) {
      onChange(value.filter(g => g !== genre));
    } else if (value.length < maxSelections) {
      onChange([...value, genre]);
    }
  };

  const removeGenre = (genre: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(g => g !== genre));
  };

  // Show first 8 genres when collapsed, all when expanded
  const visibleGenres = isExpanded ? GENRES : GENRES.slice(0, 8);
  const hasMore = GENRES.length > 8;

  return (
    <div className="space-y-3">
      {/* Selected genres display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(genre => (
            <span
              key={genre}
              className="flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1.5 text-sm font-medium text-violet-300"
            >
              {genre}
              <button
                type="button"
                onClick={e => removeGenre(genre, e)}
                className="rounded-full p-0.5 transition-colors hover:bg-violet-500/30"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Genre chips grid */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex flex-wrap gap-2">
          {visibleGenres.map(genre => {
            const isSelected = value.includes(genre);
            const isDisabled = !isSelected && value.length >= maxSelections;

            return (
              <button
                key={genre}
                type="button"
                onClick={() => !isDisabled && toggleGenre(genre)}
                disabled={isDisabled}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-all active:scale-95',
                  isSelected
                    ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                    : isDisabled
                      ? 'cursor-not-allowed border-zinc-800 text-zinc-600'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                )}
              >
                {isSelected && <Check className="h-3.5 w-3.5" />}
                {genre}
              </button>
            );
          })}
        </div>

        {/* Expand/Collapse button */}
        {hasMore && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 py-2 text-sm text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-400"
          >
            <span>{isExpanded ? 'Ver menos' : `Ver más géneros (${GENRES.length - 8})`}</span>
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
            />
          </button>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-zinc-600">
        {value.length === 0
          ? 'Selecciona hasta 5 géneros'
          : `${value.length}/${maxSelections} géneros seleccionados`}
      </p>
    </div>
  );
}

// Helper to convert between string and array (for backwards compatibility)
export function parseGenres(genre: string | null | undefined): string[] {
  if (!genre) return [];
  // If it contains comma, split it
  if (genre.includes(',')) {
    return genre
      .split(',')
      .map(g => g.trim())
      .filter(Boolean);
  }
  // Single genre
  return [genre];
}

export function stringifyGenres(genres: string[]): string {
  return genres.join(', ');
}
