'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import { useRouter } from 'next/navigation';
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
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudioAnalysis } from '@/hooks/use-audio-analysis';
import { AudioMomentsCategorized } from '@/components/features/audio-moments';
import { type AudioMoment } from '@/lib/audio';

type Step = 'video' | 'moments' | 'formats' | 'intent' | 'subtitles';

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
  audioMoments: AudioMoment[];
  selectedMomentIndices: number[];
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
  { id: 'moments', label: 'Momentos', icon: Zap },
  { id: 'formats', label: 'Formatos', icon: Layers },
  { id: 'intent', label: 'Intención', icon: Sparkles },
  { id: 'subtitles', label: 'Subtítulos', icon: Type },
];

const DEFAULT_WIZARD_STATE: WizardState = {
  currentStep: 'video',
  videoUrl: null,
  videoInfo: null,
  audioMoments: [],
  selectedMomentIndices: [],
  selectedFormats: [],
  selectedIntent: 'viral',
  subtitleSettings: DEFAULT_SUBTITLE_SETTINGS,
};

export default function ClipGeneratorPage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [wizardState, setWizardState] = useState<WizardState>(DEFAULT_WIZARD_STATE);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const { analyze, result: audioResult, isAnalyzing } = useAudioAnalysis();

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

  const {
    currentStep,
    videoUrl,
    videoInfo,
    audioMoments,
    selectedMomentIndices,
    selectedFormats,
    selectedIntent,
    subtitleSettings,
  } = wizardState;

  const updateWizard = useCallback((updates: Partial<WizardState>) => {
    setWizardState(prev => ({ ...prev, ...updates }));
  }, []);

  // Analyze audio when entering moments step
  useEffect(() => {
    if (
      currentStep === 'moments' &&
      videoUrl &&
      (!audioMoments || audioMoments.length === 0) &&
      !isAnalyzing
    ) {
      analyze(videoUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, videoUrl]);

  // Update wizard state when audio analysis completes
  useEffect(() => {
    if (audioResult && currentStep === 'moments' && (!audioMoments || audioMoments.length === 0)) {
      // Use startTransition to avoid cascading renders
      startTransition(() => {
        // Select only top 10 moments by confidence
        const topMoments = audioResult.moments
          .map((moment, index) => ({ moment, index }))
          .sort((a, b) => b.moment.confidence - a.moment.confidence)
          .slice(0, 10)
          .map(item => item.index);

        updateWizard({
          audioMoments: audioResult.moments,
          selectedMomentIndices: topMoments,
        });
      });
    }
  }, [audioResult, currentStep, audioMoments, updateWizard]);

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
      updateWizard({ currentStep: 'moments' });
    } else if (currentStep === 'moments') {
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
    if (currentStep === 'moments') {
      updateWizard({ currentStep: 'video' });
    } else if (currentStep === 'formats') {
      updateWizard({ currentStep: 'moments' });
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
    setWizardState(DEFAULT_WIZARD_STATE);
    setVerifyError(null);
  };

  const canProceed = () => {
    if (currentStep === 'video') return !!videoInfo;
    if (currentStep === 'moments') return true;
    if (currentStep === 'formats') return selectedFormats.length > 0;
    if (currentStep === 'intent') return !!selectedIntent;
    if (currentStep === 'subtitles') return true;
    return false;
  };

  const hasProgress =
    isHydrated && (videoUrl || selectedFormats.length > 0 || currentStep !== 'video');

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pt-20 sm:px-6 sm:py-10 md:px-8 lg:px-12 lg:pt-10">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          {/* Title + Reset */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Generador de Clips
              </h1>
              <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                Transforma tus videos en clips virales optimizados para TikTok, Reels, YouTube
                Shorts y más. Soporta múltiples formatos y configuraciones personalizadas.
              </p>
            </div>
            {hasProgress && (
              <button
                onClick={handleClearAll}
                className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            )}
          </div>
        </div>

        {/* Steps indicator */}
        <div className="overflow-x-auto">
          <div className="flex min-w-max items-center justify-center gap-2 pb-2 sm:min-w-0 sm:justify-start sm:gap-0 sm:pb-0">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = step.id === currentStep;
              const isLast = index === STEPS.length - 1;

              return (
                <div key={step.id} className={cn('flex items-center', !isLast && 'sm:flex-1')}>
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
                        'mx-2 h-px w-8 shrink-0 sm:mx-4 sm:w-auto sm:flex-1',
                        index < currentStepIndex ? 'bg-emerald-500' : 'bg-zinc-800'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="overflow-x-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:rounded-2xl sm:p-6 md:p-8">
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
                <div className="overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                      <CheckCircle className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">Video verificado</p>
                      <p className="mt-0.5 break-all text-xs text-zinc-500 sm:text-sm">
                        {videoUrl}
                      </p>
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

          {currentStep === 'moments' && (
            <div className="space-y-6 overflow-x-hidden">
              <div>
                <h2 className="text-lg font-medium text-white">Momentos detectados</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Analizamos tu video y detectamos estos momentos interesantes
                </p>
              </div>

              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-violet-400" />
                  <p className="text-sm text-zinc-400">Analizando audio del video...</p>
                  <p className="text-xs text-zinc-600">
                    Descargando y procesando, esto puede tomar unos segundos
                  </p>
                </div>
              ) : audioMoments && audioMoments.length > 0 ? (
                <AudioMomentsCategorized
                  moments={audioMoments}
                  selectedMoments={selectedMomentIndices}
                  videoUrl={videoUrl || ''}
                  duration={audioResult?.duration || 0}
                  onToggleMoment={(index: number) => {
                    const newSelected = selectedMomentIndices.includes(index)
                      ? selectedMomentIndices.filter((i: number) => i !== index)
                      : [...selectedMomentIndices, index];
                    updateWizard({ selectedMomentIndices: newSelected });
                  }}
                />
              ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                  <Zap className="mx-auto h-12 w-12 text-zinc-600" />
                  <p className="mt-4 text-sm text-zinc-500">
                    No se detectaron momentos interesantes
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Puedes continuar sin seleccionar momentos específicos
                  </p>
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
