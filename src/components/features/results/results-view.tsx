'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import JSZip from 'jszip';
import {
  ArrowLeft,
  Clock,
  Star,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Video,
  Zap,
  TrendingUp,
  Download,
  Archive,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBandContext } from '@/contexts/band-context';
import Image from 'next/image';
import { Music } from 'lucide-react';

interface StoredClip {
  id: string;
  name: string;
  format: {
    id: string;
    name: string;
    aspectRatio: string;
  };
  startTime: number;
  endTime: number;
  duration: number;
  url: string;
  score: number;
  reason: string;
}

const FORMAT_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  tiktok: { icon: '♪', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  reels: { icon: '◎', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
  shorts: { icon: '▶', color: 'text-red-400', bg: 'bg-red-500/10' },
  instagram: { icon: '◻', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  youtube: { icon: '▷', color: 'text-red-400', bg: 'bg-red-500/10' },
};

export function ResultsView() {
  const router = useRouter();
  const { currentBand } = useBandContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [clips] = useState<StoredClip[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('openstage-clips');
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedClipIndex, setSelectedClipIndex] = useState(0);
  const [downloadedClips, setDownloadedClips] = useState<Set<string>>(new Set());
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const selectedClip = clips[selectedClipIndex] || null;

  useEffect(() => {
    if (clips.length === 0) {
      router.push('/tools/clip-generator');
    }
  }, [clips.length, router]);

  const handleDownloadClip = (clip: StoredClip) => {
    // Create download link
    const a = document.createElement('a');
    a.href = clip.url;
    a.download = `${clip.name}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadedClips(prev => new Set(prev).add(clip.id));
  };

  const handleDownloadAll = async () => {
    if (clips.length === 0) return;
    setIsDownloadingAll(true);

    try {
      const zip = new JSZip();

      // Fetch all blobs and add to zip
      for (const clip of clips) {
        const response = await fetch(clip.url);
        const blob = await response.blob();
        const fileName = `${clip.format.name} - ${clip.name.replace(/[^a-zA-Z0-9-_]/g, '_')}.mp4`;
        zip.file(fileName, blob);
      }

      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);

      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `openstage-clips-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(zipUrl);

      // Mark all as downloaded
      setDownloadedClips(new Set(clips.map(c => c.id)));
    } catch (error) {
      console.error('Error creating ZIP:', error);
    }

    setIsDownloadingAll(false);
  };

  const handleClearAndRestart = () => {
    // Revoke all blob URLs
    clips.forEach(clip => {
      if (clip.url.startsWith('blob:')) {
        URL.revokeObjectURL(clip.url);
      }
    });
    localStorage.removeItem('openstage-clips');
    localStorage.removeItem('openstage-wizard-state');
    router.push('/tools/clip-generator');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-400';
    if (score >= 0.8) return 'text-amber-400';
    return 'text-zinc-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 0.9) return 'bg-green-500/10 border-green-500/20';
    if (score >= 0.8) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-zinc-500/10 border-zinc-500/20';
  };

  if (clips.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
            <Video className="h-8 w-8 text-zinc-500" />
          </div>
          <h2 className="text-xl font-semibold text-white">No hay clips</h2>
          <p className="mt-2 text-zinc-400">No se encontraron clips generados.</p>
          <Link
            href="/tools/clip-generator"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            <Sparkles className="h-4 w-4" />
            Crear nuevos clips
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/tools/clip-generator"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al wizard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">Clips generados</h1>
          <p className="mt-2 flex items-center gap-2 text-zinc-400">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            {clips.length} clip{clips.length !== 1 ? 's' : ''} listo
            {clips.length !== 1 ? 's' : ''} para descargar
            {currentBand && (
              <span className="ml-2 inline-flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 text-xs font-medium text-white">
                {currentBand.logo_url ? (
                  <Image
                    src={currentBand.logo_url}
                    alt={currentBand.name}
                    width={12}
                    height={12}
                    className="rounded"
                  />
                ) : (
                  <Music className="h-3 w-3 text-violet-400" />
                )}
                {currentBand.name}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearAndRestart}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Nuevo video
          </button>
          <button
            onClick={handleDownloadAll}
            disabled={isDownloadingAll}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 disabled:opacity-50"
          >
            {isDownloadingAll ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Descargando...
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" />
                Descargar todos
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Video preview */}
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-2xl">
            {selectedClip ? (
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  key={selectedClip.id}
                  src={selectedClip.url}
                  className="h-full w-full object-contain"
                  controls
                  playsInline
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-zinc-950">
                <div className="text-center">
                  <Play className="mx-auto h-12 w-12 text-zinc-700" />
                  <p className="mt-2 text-zinc-500">Selecciona un clip para previsualizar</p>
                </div>
              </div>
            )}

            {selectedClip && (
              <div className="border-t border-zinc-800 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl text-lg',
                          FORMAT_ICONS[selectedClip.format.id]?.bg || 'bg-violet-500/10',
                          FORMAT_ICONS[selectedClip.format.id]?.color || 'text-violet-400'
                        )}
                      >
                        {FORMAT_ICONS[selectedClip.format.id]?.icon || '▶'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{selectedClip.name}</h3>
                        <p className="text-sm text-zinc-500">{selectedClip.format.name}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300">
                        <Clock className="h-3.5 w-3.5 text-zinc-500" />
                        {formatTime(selectedClip.duration)}
                      </span>
                      <span className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300">
                        {selectedClip.format.aspectRatio}
                      </span>
                      <span
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium',
                          getScoreBg(selectedClip.score),
                          getScoreColor(selectedClip.score)
                        )}
                      >
                        <TrendingUp className="h-3.5 w-3.5" />
                        {Math.round(selectedClip.score * 100)}% viral
                      </span>
                    </div>

                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-zinc-800/50 p-3">
                      <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <p className="text-sm text-zinc-400">{selectedClip.reason}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadClip(selectedClip)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                      downloadedClips.has(selectedClip.id)
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-violet-600 text-white hover:bg-violet-500'
                    )}
                  >
                    {downloadedClips.has(selectedClip.id) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Descargado
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Descargar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clips list */}
        <div className="lg:col-span-2">
          <div className="sticky top-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-400">Todos los clips</h3>
              <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-400">
                {clips.length} clips
              </span>
            </div>

            <div className="space-y-3">
              {clips.map((clip, index) => {
                const isSelected = index === selectedClipIndex;
                const isDownloaded = downloadedClips.has(clip.id);

                return (
                  <button
                    key={clip.id}
                    onClick={() => setSelectedClipIndex(index)}
                    className={cn(
                      'group w-full rounded-xl border p-4 text-left transition-all',
                      isSelected
                        ? 'border-violet-500/50 bg-violet-500/5 ring-1 ring-violet-500/20'
                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl transition-all',
                          isSelected
                            ? 'bg-violet-500/20 text-violet-400'
                            : FORMAT_ICONS[clip.format.id]?.bg || 'bg-zinc-800',
                          isSelected ? '' : FORMAT_ICONS[clip.format.id]?.color || 'text-zinc-400'
                        )}
                      >
                        {FORMAT_ICONS[clip.format.id]?.icon || '▶'}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={cn(
                              'truncate font-medium',
                              isSelected ? 'text-white' : 'text-zinc-200'
                            )}
                          >
                            {clip.name}
                          </p>
                          {isDownloaded && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                          )}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(clip.duration)}
                          </span>
                          <span>•</span>
                          <span>{clip.format.aspectRatio}</span>
                        </div>
                      </div>

                      <div
                        className={cn(
                          'flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold',
                          getScoreBg(clip.score),
                          getScoreColor(clip.score)
                        )}
                      >
                        <Star className="h-3 w-3" />
                        {Math.round(clip.score * 100)}%
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-1 text-xs text-zinc-500">{clip.reason}</p>
                  </button>
                );
              })}
            </div>

            {/* Success message */}
            <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-400">Clips listos</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Tus clips han sido procesados y están listos para descargar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
