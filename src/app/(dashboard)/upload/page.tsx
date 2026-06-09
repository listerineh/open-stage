'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VideoUrlInput } from '@/components/features/video-upload';
import { PageContainer } from '@/components/ui/page-container';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Film,
  HardDrive,
} from 'lucide-react';

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error';

interface VideoInfo {
  accessible: boolean;
  contentType?: string;
  contentLength?: number;
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  const verifyVideo = useCallback(async (url: string) => {
    setStatus('verifying');
    setVideoInfo(null);

    try {
      const response = await fetch('/api/verify-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.accessible) {
        setStatus('success');
        setVideoInfo(data);
      } else {
        setStatus('error');
        setVideoInfo({ accessible: false, error: data.error || 'No se pudo acceder al video' });
      }
    } catch {
      setStatus('error');
      setVideoInfo({ accessible: false, error: 'Error de conexión. Intenta de nuevo.' });
    }
  }, []);

  const handleUrlSubmit = (url: string) => {
    setVideoUrl(url);
    verifyVideo(url);
  };

  const handleRetry = () => {
    if (videoUrl) {
      verifyVideo(videoUrl);
    }
  };

  const handleContinue = () => {
    if (videoUrl && status === 'success') {
      router.push(`/clips/new?video=${encodeURIComponent(videoUrl)}`);
    }
  };

  const handleReset = () => {
    setVideoUrl(null);
    setStatus('idle');
    setVideoInfo(null);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Desconocido';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <PageContainer size="sm">
      <div className="space-y-8">
        <PageHeader
          title="Agregar video"
          description="Comparte un video desde Google Drive para generar clips"
        />

        {!videoUrl ? (
          <VideoUrlInput onUrlSubmit={handleUrlSubmit} />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
            {/* Status Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    status === 'verifying'
                      ? 'bg-violet-500/10'
                      : status === 'success'
                        ? 'bg-emerald-500/10'
                        : status === 'error'
                          ? 'bg-red-500/10'
                          : 'bg-zinc-800'
                  }`}
                >
                  {status === 'verifying' && (
                    <Loader2 className="h-6 w-6 text-violet-400 animate-spin" />
                  )}
                  {status === 'success' && <CheckCircle className="h-6 w-6 text-emerald-400" />}
                  {status === 'error' && <AlertTriangle className="h-6 w-6 text-red-400" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">
                    {status === 'verifying' && 'Verificando acceso...'}
                    {status === 'success' && 'Video verificado'}
                    {status === 'error' && 'Error de acceso'}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 truncate">{videoUrl}</p>

                  {status === 'error' && videoInfo?.error && (
                    <p className="mt-2 text-sm text-red-400">{videoInfo.error}</p>
                  )}
                </div>
              </div>

              {/* Video Info */}
              {status === 'success' && videoInfo && (
                <div className="mt-6 flex items-center gap-6 border-t border-zinc-800/50 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                      <Film className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Formato</p>
                      <p className="text-sm text-white">
                        {videoInfo.contentType?.split('/')[1]?.toUpperCase() || 'Video'}
                      </p>
                    </div>
                  </div>
                  {videoInfo.contentLength && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                        <HardDrive className="h-4 w-4 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Tamaño</p>
                        <p className="text-sm text-white">
                          {formatFileSize(videoInfo.contentLength)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between border-t border-zinc-800/50 pt-6">
                <button
                  onClick={handleReset}
                  className="text-sm text-zinc-500 transition-colors hover:text-white"
                >
                  Cambiar video
                </button>

                {status === 'error' && (
                  <Button variant="outline" onClick={handleRetry}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reintentar
                  </Button>
                )}

                {status === 'success' && (
                  <Button onClick={handleContinue}>
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                {status === 'verifying' && (
                  <Button disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando
                  </Button>
                )}
              </div>
            </div>

            {/* Tips for errors */}
            {status === 'error' && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
                <p className="text-sm font-medium text-zinc-300">Posibles soluciones:</p>
                <ul className="mt-2 space-y-1 text-sm text-zinc-500">
                  <li>
                    • Verifica que el enlace sea público (&quot;Cualquier persona con el
                    enlace&quot;)
                  </li>
                  <li>• Asegúrate de que el archivo sea un video válido</li>
                  <li>• Intenta copiar el enlace nuevamente desde Google Drive</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
