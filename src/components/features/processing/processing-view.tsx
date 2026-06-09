'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  processVideo,
  type ProcessingProgress,
  type GeneratedClip,
  type ProcessingConfig,
} from '@/lib/video/video-processor-client';

const STORAGE_KEY = 'openstage-wizard-state';

interface ProcessingState {
  status: 'idle' | 'processing' | 'done' | 'error';
  progress: ProcessingProgress | null;
  clips: GeneratedClip[];
  error: string | null;
}

type ProgressStage = ProcessingProgress['stage'];

const STAGE_LABELS: Record<ProgressStage, string> = {
  loading: 'Cargando procesador de video',
  downloading: 'Descargando video',
  analyzing: 'Analizando momentos clave',
  generating: 'Generando clips',
  done: 'Completado',
  error: 'Error',
};

const STAGE_ORDER: ProgressStage[] = ['loading', 'downloading', 'analyzing', 'generating', 'done'];

export function ProcessingView() {
  const router = useRouter();
  const [state, setState] = useState<ProcessingState>({
    status: 'idle',
    progress: null,
    clips: [],
    error: null,
  });

  const startProcessing = useCallback(async () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'No se encontró configuración. Vuelve al wizard.',
      }));
      return;
    }

    const wizardState = JSON.parse(stored);

    if (
      !wizardState.videoUrl ||
      !wizardState.selectedFormats?.length ||
      !wizardState.selectedIntent
    ) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Configuración incompleta. Vuelve al wizard.',
      }));
      return;
    }

    const config: ProcessingConfig = {
      videoUrl: wizardState.videoUrl,
      formats: wizardState.selectedFormats,
      intent: wizardState.selectedIntent,
      subtitles: wizardState.subtitleSettings || {
        enabled: false,
        style: 'bold',
        position: 'bottom',
        alignment: 'center',
        language: 'auto',
      },
    };

    setState(prev => ({ ...prev, status: 'processing' }));

    try {
      // Process video using FFmpeg client
      const clips = await processVideo(config, progress => {
        setState(prev => ({
          ...prev,
          progress,
        }));
      });

      setState(prev => ({
        ...prev,
        status: 'done',
        clips,
      }));

      // Store clips info for results page (without blob, just URL)
      localStorage.setItem(
        'openstage-clips',
        JSON.stringify(
          clips.map(c => ({
            id: c.id,
            name: c.name,
            format: c.format,
            startTime: c.startTime,
            endTime: c.endTime,
            duration: c.duration,
            url: c.url,
            score: c.score,
            reason: c.reason,
          }))
        )
      );

      setTimeout(() => {
        router.push('/results');
      }, 1500);
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  }, [router]);

  // Start processing on mount
  const hasStartedRef = useRef(false);
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startProcessing();
    }
  }, [startProcessing]);

  const currentStageIndex = state.progress ? STAGE_ORDER.indexOf(state.progress.stage) : -1;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center">
          {state.status === 'processing' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              </div>
              <h1 className="text-2xl font-semibold text-white">Procesando video</h1>
              <p className="mt-2 text-zinc-400">{state.progress?.message || 'Iniciando...'}</p>
            </>
          )}

          {state.status === 'done' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-semibold text-white">Procesamiento completado</h1>
              <p className="mt-2 text-zinc-400">
                {state.clips.length} clips generados. Redirigiendo...
              </p>
            </>
          )}

          {state.status === 'error' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-semibold text-white">Error en el procesamiento</h1>
              <p className="mt-2 text-zinc-400">{state.error}</p>
            </>
          )}
        </div>

        {/* Progress bar */}
        {state.status === 'processing' && state.progress && (
          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-violet-500 transition-all duration-300"
                style={{ width: `${state.progress.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-zinc-500">
              <span>{Math.round(state.progress.progress)}%</span>
              {state.progress.currentClip && state.progress.totalClips && (
                <span>
                  Clip {state.progress.currentClip} de {state.progress.totalClips}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stage indicators */}
        {state.status === 'processing' && (
          <div className="space-y-3">
            {STAGE_ORDER.slice(0, -1).map((stage, index) => {
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const isPending = index > currentStageIndex;

              return (
                <div
                  key={stage}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border px-4 py-3 transition-all',
                    isCompleted && 'border-green-500/30 bg-green-500/5',
                    isCurrent && 'border-violet-500/50 bg-violet-500/5',
                    isPending && 'border-zinc-800 bg-zinc-900/50 opacity-50'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full',
                      isCompleted && 'bg-green-500',
                      isCurrent && 'bg-violet-500',
                      isPending && 'bg-zinc-700'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <span className="text-xs text-zinc-400">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isCompleted && 'text-green-400',
                      isCurrent && 'text-white',
                      isPending && 'text-zinc-500'
                    )}
                  >
                    {STAGE_LABELS[stage]}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        {state.status === 'error' && (
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.push('/create')}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            >
              Volver al wizard
            </button>
            <button
              onClick={() => {
                setState({ status: 'idle', progress: null, clips: [], error: null });
              }}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Warning */}
        {state.status === 'processing' && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="text-sm">
              <p className="font-medium text-amber-400">No cierres esta pestaña</p>
              <p className="mt-1 text-zinc-400">
                El procesamiento se realiza en tu navegador. Cerrar la pestaña cancelará el proceso.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
