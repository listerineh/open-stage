'use client';

import { useState, useRef, useEffect } from 'react';
import { Zap, Volume2, TrendingUp, CheckCircle2, Star, Play, Pause, Loader2 } from 'lucide-react';
import { type AudioMoment, formatTimestamp, getMomentDescription } from '@/lib/audio';
import { cn } from '@/lib/utils';

interface Props {
  moments: AudioMoment[];
  selectedMoments: number[];
  onToggleMoment: (index: number) => void;
  audioUrl?: string;
  duration: number;
}

type Category = 'all' | 'peak' | 'silence' | 'transition';

export function AudioMomentsMobileV2({
  moments,
  selectedMoments,
  onToggleMoment,
  audioUrl,
  duration,
}: Props) {
  const [category, setCategory] = useState<Category>('all');
  const [playing, setPlaying] = useState<number | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const playPreview = async (m: AudioMoment, i: number) => {
    // Pausar audio anterior
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Si ya estaba reproduciendo este, solo pausar
    if (playing === i) {
      setPlaying(null);
      return;
    }

    if (!audioUrl) return;

    try {
      setLoading(i);

      // Crear audio element con el blob URL
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Tiempo de inicio (1.5s antes del momento)
      const startTime = Math.max(0, m.timestamp - 1.5);

      // Esperar a que cargue metadata
      await new Promise<void>((resolve, reject) => {
        audio.onloadedmetadata = () => resolve();
        audio.onerror = () => reject(new Error('Error loading'));
      });

      // Hacer seek al timestamp
      audio.currentTime = startTime;

      await audio.play();
      setLoading(null);
      setPlaying(i);

      // Parar después de 4 segundos
      const timeoutId = setTimeout(() => {
        if (audioRef.current === audio) {
          audio.pause();
          setPlaying(null);
        }
      }, 4000);

      audio.onpause = () => clearTimeout(timeoutId);
      audio.onended = () => {
        clearTimeout(timeoutId);
        setPlaying(null);
      };
    } catch (err) {
      console.error('Preview error:', err);
      setLoading(null);
      setPlaying(null);
    }
  };

  const filtered = category === 'all' ? moments : moments.filter(m => m.type === category);

  // Top 5 momentos por energía (nuestras sugerencias)
  const top5Indices = moments
    .map((m, i) => ({ energy: m.energy, index: i }))
    .sort((a, b) => b.energy - a.energy)
    .slice(0, 5)
    .map(x => x.index);

  // Separar top 5 del resto para la lista filtrada
  const top5Filtered = filtered.filter((_, idx) => {
    const originalIndex = moments.indexOf(filtered[idx]);
    return top5Indices.includes(originalIndex);
  });
  const restFiltered = filtered.filter((_, idx) => {
    const originalIndex = moments.indexOf(filtered[idx]);
    return !top5Indices.includes(originalIndex);
  });

  const icon = (t: string) => (t === 'peak' ? Zap : t === 'silence' ? Volume2 : TrendingUp);
  const color = (t: string, sel: boolean) =>
    sel
      ? 'bg-violet-500'
      : t === 'peak'
        ? 'bg-violet-500/50'
        : t === 'silence'
          ? 'bg-blue-500/50'
          : 'bg-emerald-500/50';

  if (!moments.length) {
    return <div className="py-8 text-center text-sm text-zinc-500">No se detectaron momentos</div>;
  }

  return (
    <div className="box-border flex w-full flex-col gap-3">
      {/* Timeline */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[10px] text-zinc-500">
          <span>0:00</span>
          <span>{formatTimestamp(duration)}</span>
        </div>
        <div className="relative h-24 w-full rounded-lg border border-zinc-800 bg-zinc-900/50">
          {filtered.map(m => {
            const i = moments.indexOf(m);
            const pct = Math.min(Math.max((m.timestamp / duration) * 100, 2), 98);
            return (
              <button
                key={i}
                onClick={() => onToggleMoment(i)}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pct}%` }}
              >
                <div
                  className={cn(
                    'h-16 w-2 rounded-full',
                    color(m.type, selectedMoments.includes(i))
                  )}
                />
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Picos
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Silencios
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Trans.
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid w-full grid-cols-4 gap-1">
        {(['all', 'peak', 'silence', 'transition'] as Category[]).map(c => {
          const labels: Record<Category, string> = {
            all: 'Todos',
            peak: 'Picos',
            silence: 'Silenc.',
            transition: 'Trans.',
          };
          const cnt = c === 'all' ? moments.length : moments.filter(m => m.type === c).length;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded px-1 py-1.5 text-[11px] font-medium',
                category === c ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-800/50 text-zinc-500'
              )}
            >
              {labels[c]} {cnt}
            </button>
          );
        })}
      </div>

      {/* Top 5 - Nuestras sugerencias */}
      {top5Filtered.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-amber-400">
            <Star className="h-3 w-3 fill-amber-400" />
            <span>Nuestras sugerencias ({top5Filtered.length})</span>
          </div>
          {top5Filtered.map(m => {
            const i = moments.indexOf(m);
            const Icon = icon(m.type);
            const sel = selectedMoments.includes(i);

            return (
              <div
                key={`top-${i}`}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border p-3',
                  sel ? 'border-amber-500/50 bg-amber-500/10' : 'border-amber-500/30 bg-amber-500/5'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    sel ? 'bg-amber-500/20' : 'bg-zinc-800'
                  )}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium text-white">
                      {getMomentDescription(m)}
                    </span>
                    <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-xs text-zinc-500">
                    {formatTimestamp(m.timestamp)} • {Math.round(m.energy * 100)}% energía
                  </span>
                </div>
                <div className="flex shrink-0 gap-2">
                  {audioUrl && (
                    <button
                      onClick={() => playPreview(m, i)}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg transition-colors active:scale-95',
                        playing === i || loading === i
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-zinc-800 text-zinc-400'
                      )}
                    >
                      {loading === i ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : playing === i ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => onToggleMoment(i)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg transition-colors active:scale-95',
                      sel ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                    )}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resto de momentos */}
      {restFiltered.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <span>Otros momentos ({restFiltered.length})</span>
          </div>
          {restFiltered.map(m => {
            const i = moments.indexOf(m);
            const Icon = icon(m.type);
            const sel = selectedMoments.includes(i);

            return (
              <div
                key={`rest-${i}`}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border p-3',
                  sel ? 'border-violet-500/50 bg-violet-500/10' : 'border-zinc-800 bg-zinc-900/30'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    sel ? 'bg-violet-500/20' : 'bg-zinc-800'
                  )}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
                  <span className="truncate text-sm font-medium text-white">
                    {getMomentDescription(m)}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {formatTimestamp(m.timestamp)} • {Math.round(m.energy * 100)}% energía
                  </span>
                </div>
                <div className="flex shrink-0 gap-2">
                  {audioUrl && (
                    <button
                      onClick={() => playPreview(m, i)}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg transition-colors active:scale-95',
                        playing === i || loading === i
                          ? 'bg-violet-500/20 text-violet-400'
                          : 'bg-zinc-800 text-zinc-400'
                      )}
                    >
                      {loading === i ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : playing === i ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => onToggleMoment(i)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg transition-colors active:scale-95',
                      sel ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-800 text-zinc-400'
                    )}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
