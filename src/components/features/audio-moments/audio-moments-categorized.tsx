'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Zap,
  Volume2,
  TrendingUp,
  CheckCircle2,
  Play,
  Pause,
  X,
  Loader2,
  Star,
} from 'lucide-react';
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
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
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
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (playingIndex === index) {
      // If clicking the same moment, just stop
      setPlayingIndex(null);
      setLoadingIndex(null);
      return;
    }

    try {
      // Show loading state
      setLoadingIndex(index);
      setPlayingIndex(null);

      // Extract fileId from URL
      const fileIdMatch = videoUrl.match(/\/d\/([^/]+)/);
      if (!fileIdMatch) {
        console.error('Could not extract fileId from URL');
        setLoadingIndex(null);
        return;
      }
      const fileId = fileIdMatch[1];

      // Create a new audio element for this preview
      const audio = new Audio(`/api/download-video?fileId=${fileId}`);

      // Update ref immediately
      audioRef.current = audio;

      console.log(`Loading preview at ${formatTimestamp(moment.timestamp)}...`);

      // Wait for metadata to be loaded before setting currentTime
      await new Promise<void>((resolve, reject) => {
        audio.onloadedmetadata = () => {
          const startTime = Math.max(0, moment.timestamp - 1.5);
          audio.currentTime = startTime;
          console.log(`Playing from ${startTime}s`);
          resolve();
        };
        audio.onerror = () => reject(new Error('Failed to load audio'));
        audio.load();
      });

      // Now play the audio
      await audio.play();

      // Update state: loading done, now playing
      setLoadingIndex(null);
      setPlayingIndex(index);

      // Stop after 3 seconds
      const timeout = setTimeout(() => {
        audio.pause();
        setPlayingIndex(null);
      }, 3000);

      // Cleanup when audio ends
      audio.onended = () => {
        clearTimeout(timeout);
        setPlayingIndex(null);
      };
    } catch (error) {
      console.error('Error playing audio preview:', error);
      setLoadingIndex(null);
      setPlayingIndex(null);
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

  // Calculate top 10 moments by confidence
  const topMomentIndices = moments
    .map((moment, index) => ({ moment, index }))
    .sort((a, b) => b.moment.confidence - a.moment.confidence)
    .slice(0, 10)
    .map(item => item.index);

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
    <div className={cn('w-full space-y-4 overflow-x-hidden', className)}>
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

      {/* Info banner */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 sm:h-8 sm:w-8">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 sm:h-4 sm:w-4" />
          </div>
          <div className="flex-1 text-xs text-zinc-400">
            <p className="font-medium text-zinc-300">Top 10 preseleccionados</p>
            <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:gap-0">
              <span className="flex items-center gap-1">
                <span className="font-medium text-amber-400">Top:</span>
                <span className="hidden sm:inline">Mayor confianza</span>
                <span className="sm:hidden">Confianza</span>
              </span>
              <span className="hidden sm:inline"> • </span>
              <span className="flex items-center gap-1 sm:ml-2">
                <span className="font-medium text-violet-400">Energía:</span>
                <span className="hidden sm:inline">Intensidad del audio</span>
                <span className="sm:hidden">Intensidad</span>
              </span>
              <span className="hidden sm:inline"> • </span>
              <span className="flex items-center gap-1 sm:ml-2">
                <span>▶️ Preview:</span>
                <span className="hidden sm:inline">Escucha 3 segundos</span>
                <span className="sm:hidden">3 seg</span>
              </span>
            </div>
          </div>
        </div>
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
            const isLoading = loadingIndex === originalIndex;
            const isTopMoment = topMomentIndices.includes(originalIndex);
            const colorClasses = getMomentColor(moment.type);

            return (
              <div
                key={originalIndex}
                className={cn(
                  'group relative rounded-lg border p-3 transition-all sm:p-4',
                  isSelected
                    ? 'border-violet-500/50 bg-violet-500/10'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                )}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all sm:h-10 sm:w-10',
                      isSelected ? 'border-violet-500/50 bg-violet-500/20' : colorClasses
                    )}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                          <p className="text-xs font-medium text-white sm:text-sm">
                            {getMomentDescription(moment)}
                          </p>
                          {isTopMoment && (
                            <span className="flex w-fit items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-400 sm:px-2">
                              <Star className="h-2.5 w-2.5 fill-amber-400 sm:h-3 sm:w-3" />
                              Top
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {formatTimestamp(moment.timestamp)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        {/* Preview button */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            playPreview(moment, originalIndex);
                          }}
                          disabled={isLoading}
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-lg border transition-all sm:h-8 sm:w-8',
                            isLoading
                              ? 'border-violet-500/50 bg-violet-500/20 text-violet-400'
                              : isPlaying
                                ? 'border-violet-500/50 bg-violet-500/20 text-violet-400'
                                : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                          )}
                          title={isLoading ? 'Cargando...' : 'Preview audio'}
                        >
                          {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                          ) : isPlaying ? (
                            <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          ) : (
                            <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                        </button>

                        {/* Confidence badge */}
                        <span className="hidden rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 sm:inline">
                          {Math.round(moment.confidence * 100)}%
                        </span>

                        {/* Select/Deselect button */}
                        <button
                          onClick={() => onToggleMoment(originalIndex)}
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-lg border transition-all sm:h-8 sm:w-8',
                            isSelected
                              ? 'border-violet-500/50 bg-violet-500/20 text-violet-400'
                              : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                          )}
                          title={isSelected ? 'Deseleccionar' : 'Seleccionar'}
                        >
                          {isSelected ? (
                            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          ) : (
                            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Energy bar */}
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-zinc-600">Energía</span>
                        <span className="text-xs text-zinc-500">
                          {Math.round(moment.energy * 100)}%
                        </span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
