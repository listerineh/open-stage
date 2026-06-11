'use client';

import { useState, useRef, useEffect } from 'react';
import { Zap, Volume2, TrendingUp, CheckCircle2, Play, Pause, X } from 'lucide-react';
import { type AudioMoment, formatTimestamp, getMomentDescription } from '@/lib/audio';
import { cn } from '@/lib/utils';
import { AudioTimeline } from './audio-timeline';

interface AudioMomentsCategorizedProps {
  moments: AudioMoment[];
  selectedMoments: number[];
  onToggleMoment: (index: number) => void;
  videoUrl: string;
  duration: number;
  className?: string;
}

type Category = 'all' | 'peak' | 'silence' | 'transition';

export function AudioMomentsCategorized({
  moments,
  selectedMoments,
  onToggleMoment,
  videoUrl,
  duration,
  className,
}: AudioMomentsCategorizedProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current && videoUrl) {
      // Extract fileId from URL
      const fileIdMatch = videoUrl.match(/\/d\/([^/]+)/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        const audio = new Audio(`/api/download-video?fileId=${fileId}`);
        audio.preload = 'auto';
        audioRef.current = audio;

        console.log('Audio element initialized for fileId:', fileId);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [videoUrl]);

  const playPreview = async (moment: AudioMoment, index: number) => {
    if (!audioRef.current) {
      console.error('Audio element not initialized');
      return;
    }

    if (playingIndex === index) {
      // Stop playing
      audioRef.current.pause();
      setPlayingIndex(null);
    } else {
      try {
        // Start playing from moment timestamp (3 seconds before to 3 seconds after)
        const startTime = Math.max(0, moment.timestamp - 1.5);
        audioRef.current.currentTime = startTime;

        // Wait for audio to be ready
        await audioRef.current.play();
        setPlayingIndex(index);

        // Stop after 3 seconds
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            setPlayingIndex(null);
          }
        }, 3000);
      } catch (error) {
        console.error('Error playing audio preview:', error);
        setPlayingIndex(null);
      }
    }
  };

  const categories: { id: Category; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'Todos', icon: Zap },
    { id: 'peak', label: 'Picos', icon: Zap },
    { id: 'silence', label: 'Silencios', icon: Volume2 },
    { id: 'transition', label: 'Transiciones', icon: TrendingUp },
  ];

  const filteredMoments = moments.filter(m =>
    activeCategory === 'all' ? true : m.type === activeCategory
  );

  const filteredIndices = filteredMoments.map(m => moments.indexOf(m));

  const getMomentColor = (type: AudioMoment['type']) => {
    switch (type) {
      case 'peak':
        return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
      case 'silence':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'transition':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getMomentIcon = (type: AudioMoment['type']) => {
    switch (type) {
      case 'peak':
        return Zap;
      case 'silence':
        return Volume2;
      case 'transition':
        return TrendingUp;
      default:
        return Zap;
    }
  };

  if (moments.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center',
          className
        )}
      >
        <Volume2 className="mx-auto h-12 w-12 text-zinc-600" />
        <p className="mt-4 text-sm text-zinc-500">No se detectaron momentos interesantes</p>
        <p className="mt-1 text-xs text-zinc-600">Intenta con un video diferente</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Timeline */}
      <AudioTimeline
        moments={filteredMoments}
        selectedMoments={selectedMoments.filter((i: number) => filteredIndices.includes(i))}
        duration={duration}
        onToggleMoment={onToggleMoment}
      />

      {/* Category tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(category => {
          const Icon = category.icon;
          const count =
            category.id === 'all'
              ? moments.length
              : moments.filter(m => m.type === category.id).length;

          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                activeCategory === category.id
                  ? 'border-violet-500/50 bg-violet-500/10 text-violet-400'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{category.label}</span>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Moments list */}
      <div className="space-y-2">
        {filteredMoments.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-center">
            <p className="text-sm text-zinc-500">No hay momentos en esta categoría</p>
          </div>
        ) : (
          filteredMoments.map((moment, index) => {
            const originalIndex = moments.indexOf(moment);
            const Icon = getMomentIcon(moment.type);
            const isSelected = selectedMoments.includes(originalIndex);
            const isPlaying = playingIndex === originalIndex;
            const colorClasses = getMomentColor(moment.type);

            return (
              <div
                key={originalIndex}
                className={cn(
                  'group relative rounded-lg border p-4 transition-all',
                  isSelected
                    ? 'border-violet-500/50 bg-violet-500/10'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all',
                      isSelected ? 'border-violet-500/50 bg-violet-500/20' : colorClasses
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">
                          {getMomentDescription(moment)}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {formatTimestamp(moment.timestamp)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-2">
                        {/* Preview button */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            playPreview(moment, originalIndex);
                          }}
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg border transition-all',
                            isPlaying
                              ? 'border-violet-500/50 bg-violet-500/20 text-violet-400'
                              : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                          )}
                          title="Preview audio"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>

                        {/* Confidence badge */}
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                          {Math.round(moment.confidence * 100)}%
                        </span>

                        {/* Select/Deselect button */}
                        <button
                          onClick={() => onToggleMoment(originalIndex)}
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg border transition-all',
                            isSelected
                              ? 'border-violet-500/50 bg-violet-500/20 text-violet-400'
                              : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                          )}
                          title={isSelected ? 'Deseleccionar' : 'Seleccionar'}
                        >
                          {isSelected ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Energy bar */}
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={cn(
                          'h-full transition-all',
                          isSelected ? 'bg-violet-500' : 'bg-zinc-600'
                        )}
                        style={{ width: `${moment.energy * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
