'use client';

import {
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  Play,
  Pause,
  Cloud,
  CloudOff,
  Check,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { type ClipProgress, type ClipResult } from '@/lib/clip-generator/types';
import { formatTimestamp } from '@/lib/audio';
import { cn } from '@/lib/utils';

interface ClipProgressListProps {
  progress: ClipProgress[];
  clips: ClipResult[];
  onDownload: (clip: ClipResult) => void;
  driveConnected?: boolean;
  onConnectDrive?: () => void;
  onSaveToDrive?: (clip: ClipResult) => Promise<void>;
}

export function ClipProgressList({
  progress,
  clips,
  onDownload,
  driveConnected = false,
  onConnectDrive,
  onSaveToDrive,
}: ClipProgressListProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [savingToDrive, setSavingToDrive] = useState<string | null>(null);
  const [savedToDrive, setSavedToDrive] = useState<Set<string>>(new Set());
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const handleSaveToDrive = async (clip: ClipResult) => {
    if (!onSaveToDrive || savingToDrive) return;
    setSavingToDrive(clip.id);
    try {
      await onSaveToDrive(clip);
      setSavedToDrive(prev => new Set([...prev, clip.id]));
    } finally {
      setSavingToDrive(null);
    }
  };

  const togglePlay = (clipId: string) => {
    const video = videoRefs.current.get(clipId);
    if (!video) return;

    if (playingId === clipId) {
      video.pause();
      setPlayingId(null);
    } else {
      videoRefs.current.forEach((v, id) => {
        if (id !== clipId) v.pause();
      });
      video.play();
      setPlayingId(clipId);
    }
  };

  const getStageIcon = (stage: ClipProgress['stage']) => {
    switch (stage) {
      case 'queued':
        return <div className="h-4 w-4 rounded-full bg-zinc-600" />;
      case 'downloading':
      case 'processing':
      case 'encoding':
        return <Loader2 className="h-4 w-4 animate-spin text-violet-400" />;
      case 'done':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getStageLabel = (stage: ClipProgress['stage']) => {
    switch (stage) {
      case 'queued':
        return 'En cola';
      case 'downloading':
        return 'Descargando';
      case 'processing':
        return 'Procesando';
      case 'encoding':
        return 'Codificando';
      case 'done':
        return 'Completado';
      case 'error':
        return 'Error';
    }
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {progress.map(p => {
        const clip = clips.find(c => c.format.id === p.formatId && c.momentIndex === p.momentIndex);
        const isComplete = p.stage === 'done' && clip;

        return (
          <div
            key={p.id}
            className={cn(
              'flex w-full flex-col gap-3 rounded-lg border p-3',
              p.stage === 'error'
                ? 'border-red-500/30 bg-red-500/5'
                : p.stage === 'done'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-zinc-800 bg-zinc-900/30'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {getStageIcon(p.stage)}
                <span className="text-sm font-medium text-white">Clip {p.momentIndex + 1}</span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-400">
                  {p.formatId}
                </span>
                {clip && (
                  <span className="text-xs text-zinc-500">
                    {formatTimestamp(clip.timestamp)} • {clip.duration}s
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium shrink-0',
                  p.stage === 'error'
                    ? 'text-red-400'
                    : p.stage === 'done'
                      ? 'text-emerald-400'
                      : 'text-zinc-400'
                )}
              >
                {getStageLabel(p.stage)}
              </span>
            </div>

            {/* Progress bar */}
            {p.stage !== 'done' && p.stage !== 'error' && (
              <div className="flex flex-col gap-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-violet-500 transition-all duration-300"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-500">{p.message}</span>
              </div>
            )}

            {/* Video preview - Mobile first responsive */}
            {isComplete && clip && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                {/* Video container - Full width en mobile, fixed en desktop */}
                <div className="relative mx-auto w-full max-w-70 overflow-hidden rounded-xl bg-black sm:mx-0 sm:w-40 sm:shrink-0 md:w-48">
                  <div className="aspect-9/16">
                    <video
                      ref={el => {
                        if (el) videoRefs.current.set(clip.id, el);
                      }}
                      src={clip.url}
                      className="h-full w-full object-cover"
                      onEnded={() => setPlayingId(null)}
                      playsInline
                    />
                  </div>
                  <button
                    onClick={() => togglePlay(clip.id)}
                    className={cn(
                      'absolute inset-0 flex items-center justify-center transition-opacity',
                      playingId === clip.id ? 'bg-black/20' : 'bg-black/40 hover:bg-black/30'
                    )}
                  >
                    {playingId === clip.id ? (
                      <Pause className="h-10 w-10 text-white drop-shadow-lg sm:h-8 sm:w-8" />
                    ) : (
                      <Play className="h-10 w-10 text-white drop-shadow-lg sm:h-8 sm:w-8" />
                    )}
                  </button>
                </div>

                {/* Actions - Centrado vertical en desktop */}
                <div className="flex flex-1 flex-col justify-center gap-2">
                  {/* Descargar */}
                  <button
                    onClick={() => onDownload(clip)}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-violet-500/20 px-4 py-2.5 text-sm font-medium text-violet-400 transition-colors hover:bg-violet-500/30 active:scale-[0.98]"
                  >
                    <Download className="h-4 w-4" />
                    <span>Descargar</span>
                  </button>

                  {/* Guardar en Drive */}
                  {driveConnected && onSaveToDrive ? (
                    <button
                      onClick={() => handleSaveToDrive(clip)}
                      disabled={savingToDrive === clip.id || savedToDrive.has(clip.id)}
                      className={cn(
                        'flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors active:scale-[0.98]',
                        savedToDrive.has(clip.id)
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      )}
                    >
                      {savingToDrive === clip.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : savedToDrive.has(clip.id) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Cloud className="h-4 w-4" />
                      )}
                      <span>
                        {savedToDrive.has(clip.id) ? 'Guardado en Drive' : 'Guardar en Drive'}
                      </span>
                    </button>
                  ) : onConnectDrive ? (
                    <button
                      onClick={onConnectDrive}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-300 active:scale-[0.98]"
                    >
                      <CloudOff className="h-4 w-4" />
                      <span>Conectar Drive</span>
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {/* Error message */}
            {p.stage === 'error' && <p className="text-xs text-red-400">{p.message}</p>}
          </div>
        );
      })}
    </div>
  );
}
