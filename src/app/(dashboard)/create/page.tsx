'use client';

import { useState, useCallback } from 'react';
import { VideoUrlInput } from '@/components/features/video-upload';
import {
  FormatSelector,
  IntentSelector,
  SubtitleConfig,
  type SubtitleSettings,
} from '@/components/features/clip-settings';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Film,
  Layers,
  Sparkles,
  Type,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'video' | 'formats' | 'intent' | 'subtitles';

interface VideoInfo {
  accessible: boolean;
  fileId?: string;
  contentType?: string;
  contentLength?: number;
}

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'video', label: 'Video', icon: Film },
  { id: 'formats', label: 'Formatos', icon: Layers },
  { id: 'intent', label: 'Intención', icon: Sparkles },
  { id: 'subtitles', label: 'Subtítulos', icon: Type },
];

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState<Step>('video');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedIntent, setSelectedIntent] = useState<string | null>('viral');
  const [subtitleSettings, setSubtitleSettings] = useState<SubtitleSettings>({
    enabled: true,
    style: 'bold',
    position: 'bottom',
    alignment: 'center',
    language: 'auto',
  });

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const verifyVideo = useCallback(async (url: string) => {
    setIsVerifying(true);
    setVerifyError(null);

    try {
      const response = await fetch('/api/verify-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.accessible) {
        setVideoInfo(data);
        setVideoUrl(url);
      } else {
        setVerifyError(data.error || 'No se pudo acceder al video');
      }
    } catch {
      setVerifyError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const handleUrlSubmit = (url: string) => {
    verifyVideo(url);
  };

  const handleNext = () => {
    if (currentStep === 'video' && videoInfo) {
      setCurrentStep('formats');
    } else if (currentStep === 'formats' && selectedFormats.length > 0) {
      setCurrentStep('intent');
    } else if (currentStep === 'intent' && selectedIntent) {
      setCurrentStep('subtitles');
    } else if (currentStep === 'subtitles') {
      // Aquí iría la lógica de procesamiento
      console.log('Procesando...', {
        videoUrl,
        selectedFormats,
        selectedIntent,
        subtitleSettings,
      });
    }
  };

  const handleBack = () => {
    if (currentStep === 'formats') {
      setCurrentStep('video');
    } else if (currentStep === 'intent') {
      setCurrentStep('formats');
    } else if (currentStep === 'subtitles') {
      setCurrentStep('intent');
    }
  };

  const handleReset = () => {
    setVideoUrl(null);
    setVideoInfo(null);
    setVerifyError(null);
  };

  const canProceed = () => {
    if (currentStep === 'video') return !!videoInfo;
    if (currentStep === 'formats') return selectedFormats.length > 0;
    if (currentStep === 'intent') return !!selectedIntent;
    if (currentStep === 'subtitles') return true;
    return false;
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:px-8 lg:px-12">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Crear clips</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Configura tu video para generar clips optimizados
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                      isCompleted
                        ? 'border-emerald-500 bg-emerald-500'
                        : isCurrent
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-zinc-700 bg-zinc-900'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <Icon
                        className={cn('h-5 w-5', isCurrent ? 'text-violet-400' : 'text-zinc-500')}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isCurrent ? 'text-white' : isCompleted ? 'text-zinc-400' : 'text-zinc-600'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'mx-4 h-px w-16 sm:w-24',
                      index < currentStepIndex ? 'bg-emerald-500' : 'bg-zinc-800'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
          {/* Step 1: Video */}
          {currentStep === 'video' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-white">Selecciona tu video</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Pega el enlace de Google Drive de tu video
                </p>
              </div>

              {!videoInfo ? (
                <div className="space-y-4">
                  <VideoUrlInput onUrlSubmit={handleUrlSubmit} disabled={isVerifying} />

                  {isVerifying && (
                    <div className="flex items-center gap-3 rounded-lg bg-violet-500/10 px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                      <span className="text-sm text-violet-300">
                        Verificando acceso al video...
                      </span>
                    </div>
                  )}

                  {verifyError && (
                    <div className="rounded-lg bg-red-500/10 px-4 py-3">
                      <p className="text-sm text-red-400">{verifyError}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                      <CheckCircle className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">Video verificado</p>
                      <p className="mt-0.5 text-sm text-zinc-500 truncate">{videoUrl}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="mt-4 text-sm text-zinc-500 transition-colors hover:text-white"
                  >
                    Cambiar video
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Formats */}
          {currentStep === 'formats' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-white">Formatos de salida</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Selecciona los formatos en los que quieres tus clips
                </p>
              </div>

              <FormatSelector
                selectedFormats={selectedFormats}
                onSelectionChange={setSelectedFormats}
              />
            </div>
          )}

          {/* Step 3: Intent */}
          {currentStep === 'intent' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-white">Tipo de contenido</h2>
                <p className="mt-1 text-sm text-zinc-500">¿Qué tipo de clips quieres generar?</p>
              </div>

              <IntentSelector
                selectedIntent={selectedIntent}
                onSelectionChange={setSelectedIntent}
              />
            </div>
          )}

          {/* Step 4: Subtitles */}
          {currentStep === 'subtitles' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-white">Subtítulos</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Configura los subtítulos automáticos para tus clips
                </p>
              </div>

              <SubtitleConfig settings={subtitleSettings} onChange={setSubtitleSettings} />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <div>
            {currentStepIndex > 0 && (
              <Button variant="outline" size="lg" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </Button>
            )}
          </div>

          <Button size="lg" onClick={handleNext} disabled={!canProceed()}>
            {currentStep === 'subtitles' ? (
              <>
                Generar clips
                <Sparkles className="h-4 w-4" />
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
