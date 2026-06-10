'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  RotateCcw,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBandContext } from '@/contexts/band-context';
import Image from 'next/image';
import { Music } from 'lucide-react';

type Step = 'video' | 'formats' | 'intent' | 'subtitles';

interface VideoInfo {
  accessible: boolean;
  fileId?: string;
  contentType?: string;
  contentLength?: number;
}

interface WizardState {
  currentStep: Step;
  videoUrl: string | null;
  videoInfo: VideoInfo | null;
  selectedFormats: string[];
  selectedIntent: string | null;
  subtitleSettings: SubtitleSettings;
}

const STORAGE_KEY = 'openstage-wizard-state';

const DEFAULT_SUBTITLE_SETTINGS: SubtitleSettings = {
  enabled: true,
  style: 'bold',
  position: 'bottom',
  alignment: 'center',
  language: 'auto',
};

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'video', label: 'Video', icon: Film },
  { id: 'formats', label: 'Formatos', icon: Layers },
  { id: 'intent', label: 'Intención', icon: Sparkles },
  { id: 'subtitles', label: 'Subtítulos', icon: Type },
];

const DEFAULT_WIZARD_STATE: WizardState = {
  currentStep: 'video',
  videoUrl: null,
  videoInfo: null,
  selectedFormats: [],
  selectedIntent: 'viral',
  subtitleSettings: DEFAULT_SUBTITLE_SETTINGS,
};

export default function ClipGeneratorPage() {
  const router = useRouter();
  const { currentBand } = useBandContext();
  const [isHydrated, setIsHydrated] = useState(false);
  const [wizardState, setWizardState] = useState<WizardState>(DEFAULT_WIZARD_STATE);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        startTransition(() => {
          setWizardState(JSON.parse(saved));
        });
      }
    } catch {
      // ignore
    }
    startTransition(() => {
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wizardState));
    } catch {
      // ignore
    }
  }, [isHydrated, wizardState]);

  const { currentStep, videoUrl, videoInfo, selectedFormats, selectedIntent, subtitleSettings } =
    wizardState;

  const updateWizard = (updates: Partial<WizardState>) => {
    setWizardState(prev => ({ ...prev, ...updates }));
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const verifyVideo = async (url: string) => {
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
        updateWizard({ videoInfo: data, videoUrl: url });
      } else {
        setVerifyError(data.error || 'No se pudo acceder al video');
      }
    } catch {
      setVerifyError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUrlSubmit = (url: string) => {
    verifyVideo(url);
  };

  const handleNext = () => {
    if (currentStep === 'video' && videoInfo) {
      updateWizard({ currentStep: 'formats' });
    } else if (currentStep === 'formats' && selectedFormats.length > 0) {
      updateWizard({ currentStep: 'intent' });
    } else if (currentStep === 'intent' && selectedIntent) {
      updateWizard({ currentStep: 'subtitles' });
    } else if (currentStep === 'subtitles') {
      router.push('/tools/clip-generator/processing');
    }
  };

  const handleBack = () => {
    if (currentStep === 'formats') {
      updateWizard({ currentStep: 'video' });
    } else if (currentStep === 'intent') {
      updateWizard({ currentStep: 'formats' });
    } else if (currentStep === 'subtitles') {
      updateWizard({ currentStep: 'intent' });
    }
  };

  const handleReset = () => {
    updateWizard({ videoUrl: null, videoInfo: null });
    setVerifyError(null);
  };

  const handleClearAll = () => {
    setWizardState({
      currentStep: 'video',
      videoUrl: null,
      videoInfo: null,
      selectedFormats: [],
      selectedIntent: 'viral',
      subtitleSettings: DEFAULT_SUBTITLE_SETTINGS,
    });
    setVerifyError(null);
  };

  const canProceed = () => {
    if (currentStep === 'video') return !!videoInfo;
    if (currentStep === 'formats') return selectedFormats.length > 0;
    if (currentStep === 'intent') return !!selectedIntent;
    if (currentStep === 'subtitles') return true;
    return false;
  };

  const hasProgress =
    isHydrated && (videoUrl || selectedFormats.length > 0 || currentStep !== 'video');

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pt-16 sm:px-6 sm:py-10 md:px-8 lg:px-12 lg:pt-10">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-3">
          {/* Back link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Volver al dashboard</span>
            <span className="sm:hidden">Volver</span>
          </Link>

          {/* Title row */}
          <div className="flex items-start gap-4">
            {/* Icon - desktop only */}
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 sm:flex">
              <Video className="h-6 w-6 text-violet-400" />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              {/* Title + Actions */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Generador de Clips
                </h1>

                {/* Desktop: stacked actions */}
                <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
                  {currentBand && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-white">
                      {currentBand.logo_url ? (
                        <Image
                          src={currentBand.logo_url}
                          alt={currentBand.name}
                          width={16}
                          height={16}
                          className="h-4 w-4 rounded object-cover"
                        />
                      ) : (
                        <Music className="h-3.5 w-3.5 text-violet-400" />
                      )}
                      {currentBand.name}
                    </span>
                  )}
                  {hasProgress && (
                    <button
                      onClick={handleClearAll}
                      className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-white"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reiniciar
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile: band + reset inline */}
              <div className="flex items-center justify-between gap-3 sm:hidden">
                {currentBand ? (
                  <span className="inline-flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-xs font-medium text-white">
                    {currentBand.logo_url ? (
                      <Image
                        src={currentBand.logo_url}
                        alt={currentBand.name}
                        width={14}
                        height={14}
                        className="h-3.5 w-3.5 rounded object-cover"
                      />
                    ) : (
                      <Music className="h-3 w-3 text-violet-400" />
                    )}
                    {currentBand.name}
                  </span>
                ) : (
                  <span className="text-xs text-zinc-500">Crea clips virales</span>
                )}
                {hasProgress && (
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-white"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reiniciar
                  </button>
                )}
              </div>

              {/* Desktop subtitle */}
              {!currentBand && (
                <p className="hidden text-sm text-zinc-500 sm:block">
                  Crea clips virales desde tus videos
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = step.id === currentStep;
            const isLast = index === STEPS.length - 1;

            return (
              <div key={step.id} className={cn('flex items-center', !isLast && 'flex-1')}>
                <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all sm:h-10 sm:w-10',
                      isCompleted
                        ? 'border-emerald-500 bg-emerald-500'
                        : isCurrent
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-zinc-700 bg-zinc-900'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                    ) : (
                      <Icon
                        className={cn(
                          'h-4 w-4 sm:h-5 sm:w-5',
                          isCurrent ? 'text-violet-400' : 'text-zinc-500'
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      'whitespace-nowrap text-xs font-medium sm:text-sm',
                      isCurrent ? 'text-white' : isCompleted ? 'text-zinc-400' : 'text-zinc-600'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {!isLast && (
                  <div
                    className={cn(
                      'mx-2 h-px flex-1 sm:mx-4',
                      index < currentStepIndex ? 'bg-emerald-500' : 'bg-zinc-800'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:rounded-2xl sm:p-6 md:p-8">
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
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">Video verificado</p>
                      <p className="mt-0.5 truncate text-sm text-zinc-500">{videoUrl}</p>
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
                onSelectionChange={formats => updateWizard({ selectedFormats: formats })}
              />
            </div>
          )}

          {currentStep === 'intent' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-white">Tipo de contenido</h2>
                <p className="mt-1 text-sm text-zinc-500">¿Qué tipo de clips quieres generar?</p>
              </div>

              <IntentSelector
                selectedIntent={selectedIntent}
                onSelectionChange={intent => updateWizard({ selectedIntent: intent })}
              />
            </div>
          )}

          {currentStep === 'subtitles' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-white">Subtítulos</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Configura los subtítulos automáticos para tus clips
                </p>
              </div>

              <SubtitleConfig
                settings={subtitleSettings}
                onChange={settings => updateWizard({ subtitleSettings: settings })}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 pt-4">
          <div>
            {currentStepIndex > 0 && (
              <Button variant="outline" size="default" className="sm:size-lg" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Atrás</span>
              </Button>
            )}
          </div>

          <Button
            size="default"
            className="sm:size-lg"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === 'subtitles' ? (
              <>
                <span className="hidden sm:inline">Generar clips</span>
                <span className="sm:hidden">Generar</span>
                <Sparkles className="h-4 w-4" />
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Continuar</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
