'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
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
import { useClipGenerator } from '@/hooks/use-clip-generator';
import { useBand } from '@/hooks/use-band';
import { AudioMomentsMobileV2 } from '@/components/features/audio-moments';
import { ClipProgressList } from '@/components/features/clip-generator';
import { type AudioMoment } from '@/lib/audio';
import { type ClipResult } from '@/lib/clip-generator/types';
import { Download, Clapperboard, Cloud } from 'lucide-react';

type Step = 'video' | 'formats' | 'intent' | 'moments' | 'subtitles' | 'generate';

// Mapeo de intenciones a categorías de momentos
const INTENT_TO_MOMENT_TYPES: Record<string, AudioMoment['type'][]> = {
  viral: ['peak'],
  educational: ['silence'],
  storytelling: ['transition'],
  highlights: ['peak', 'transition'],
  behind_scenes: ['silence', 'transition'],
  promotional: ['peak'],
  tutorial: ['silence', 'transition'],
  entertainment: ['peak', 'transition'],
};

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
  audioDuration: number;
  selectedMomentIndices: number[];
  selectedFormats: string[];
  selectedIntents: string[];
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
  { id: 'moments', label: 'Momentos', icon: Zap },
  { id: 'subtitles', label: 'Subtítulos', icon: Type },
  { id: 'generate', label: 'Generar', icon: Clapperboard },
];

const DEFAULT_WIZARD_STATE: WizardState = {
  currentStep: 'video',
  videoUrl: null,
  videoInfo: null,
  audioMoments: [],
  audioDuration: 0,
  selectedMomentIndices: [],
  selectedFormats: [],
  selectedIntents: [],
  subtitleSettings: DEFAULT_SUBTITLE_SETTINGS,
};

export default function ClipGeneratorPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [wizardState, setWizardState] = useState<WizardState>(DEFAULT_WIZARD_STATE);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const { analyze, result: audioResult, isAnalyzing } = useAudioAnalysis();
  const clipGenerator = useClipGenerator();
  const { currentBand } = useBand();

  const driveConnected = !!currentBand?.drive_folder_id;

  const handleConnectDrive = () => {
    if (currentBand?.slug) {
      window.location.href = `/bands/${currentBand.slug}/settings?tab=integrations`;
    }
  };

  const handleSaveToDrive = async (clip: ClipResult) => {
    if (!currentBand?.drive_folder_id || !clip.blob) return;

    const formData = new FormData();
    formData.append('file', clip.blob, `clip-${clip.momentIndex + 1}.mp4`);
    formData.append('folderId', currentBand.drive_folder_id);
    formData.append('bandId', currentBand.id);

    const response = await fetch('/api/drive/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al guardar en Drive');
    }
  };

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
    audioDuration,
    selectedMomentIndices,
    selectedFormats,
    selectedIntents,
    subtitleSettings,
  } = wizardState;

  // Filtrar momentos basados en las intenciones seleccionadas
  const intentsArray = selectedIntents || [];
  const allowedMomentTypes = intentsArray.flatMap(intent => INTENT_TO_MOMENT_TYPES[intent] || []);
  const filteredMoments =
    allowedMomentTypes.length > 0
      ? audioMoments.filter(m => allowedMomentTypes.includes(m.type))
      : audioMoments;

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
          audioDuration: audioResult.duration,
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
    // Nuevo orden: video → formats → intent → moments → subtitles → generate
    if (currentStep === 'video' && videoInfo) {
      updateWizard({ currentStep: 'formats' });
    } else if (currentStep === 'formats' && selectedFormats.length > 0) {
      updateWizard({ currentStep: 'intent' });
    } else if (currentStep === 'intent' && intentsArray.length > 0) {
      updateWizard({ currentStep: 'moments' });
    } else if (currentStep === 'moments') {
      updateWizard({ currentStep: 'subtitles' });
    } else if (currentStep === 'subtitles') {
      updateWizard({ currentStep: 'generate' });
    }
  };

  const handleBack = () => {
    // Nuevo orden inverso
    if (currentStep === 'formats') {
      updateWizard({ currentStep: 'video' });
    } else if (currentStep === 'intent') {
      updateWizard({ currentStep: 'formats' });
    } else if (currentStep === 'moments') {
      updateWizard({ currentStep: 'intent' });
    } else if (currentStep === 'subtitles') {
      updateWizard({ currentStep: 'moments' });
    } else if (currentStep === 'generate') {
      updateWizard({ currentStep: 'subtitles' });
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
    if (currentStep === 'formats') return selectedFormats.length > 0;
    if (currentStep === 'intent') return intentsArray.length > 0;
    if (currentStep === 'moments') return true;
    if (currentStep === 'subtitles') return true;
    if (currentStep === 'generate') return clipGenerator.clips.length > 0;
    return false;
  };

  const handleStartGeneration = () => {
    if (!videoUrl || !audioResult) return;
    clipGenerator.generate(
      videoUrl,
      audioMoments,
      selectedMomentIndices,
      audioResult.duration,
      selectedFormats[0] || 'tiktok'
    );
  };

  const hasProgress =
    isHydrated && (videoUrl || selectedFormats.length > 0 || currentStep !== 'video');

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 pt-20 sm:px-6 sm:py-10 md:px-8 lg:px-12 lg:pt-10">
      <div className="w-full space-y-8">
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
        <div className="w-full overflow-x-auto">
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
        <div className="w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6 md:p-8">
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
            <div className="w-full space-y-6 overflow-x-hidden">
              <div>
                <h2 className="text-lg font-medium text-white">Momentos detectados</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Momentos filtrados según tus intenciones seleccionadas
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
              ) : filteredMoments.length > 0 ? (
                <AudioMomentsMobileV2
                  moments={filteredMoments}
                  selectedMoments={selectedMomentIndices}
                  videoUrl={videoUrl || ''}
                  duration={audioDuration || audioResult?.duration || 0}
                  onToggleMoment={(index: number) => {
                    const newSelected = selectedMomentIndices.includes(index)
                      ? selectedMomentIndices.filter((i: number) => i !== index)
                      : [...selectedMomentIndices, index];
                    updateWizard({ selectedMomentIndices: newSelected });
                  }}
                />
              ) : audioMoments.length > 0 ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
                  <Zap className="mx-auto h-12 w-12 text-amber-500" />
                  <p className="mt-4 text-sm text-amber-400">
                    No hay momentos para las intenciones seleccionadas
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Vuelve atrás y selecciona otras intenciones, o el video no tiene momentos de ese
                    tipo
                  </p>
                </div>
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
                <p className="mt-1 text-sm text-zinc-500">
                  Selecciona uno o más tipos de clips que quieres generar
                </p>
              </div>

              <IntentSelector
                selectedIntents={intentsArray}
                onSelectionChange={intents => updateWizard({ selectedIntents: intents })}
              />

              {intentsArray.length > 0 && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                  <p className="text-xs text-zinc-500">
                    Se mostrarán momentos de tipo:{' '}
                    <span className="text-zinc-300">
                      {[...new Set(intentsArray.flatMap(i => INTENT_TO_MOMENT_TYPES[i] || []))]
                        .map(t =>
                          t === 'peak' ? 'Picos' : t === 'silence' ? 'Silencios' : 'Transiciones'
                        )
                        .join(', ')}
                    </span>
                  </p>
                </div>
              )}
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

          {currentStep === 'generate' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-white">Generando clips</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {clipGenerator.isGenerating
                    ? `Procesando ${clipGenerator.currentClip} de ${clipGenerator.totalClips} clips...`
                    : clipGenerator.clips.length > 0
                      ? `${clipGenerator.clips.length} clips generados`
                      : `Se generarán ${selectedMomentIndices.length} clips`}
                </p>
              </div>

              {!clipGenerator.isGenerating && clipGenerator.clips.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
                    <Clapperboard className="h-8 w-8 text-violet-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-zinc-400">
                      {selectedMomentIndices.length} momentos seleccionados
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      La duración de cada clip se calculará automáticamente
                    </p>
                  </div>
                  <Button onClick={handleStartGeneration} size="lg">
                    <Sparkles className="h-4 w-4" />
                    Iniciar generación
                  </Button>
                </div>
              )}

              {(clipGenerator.isGenerating || clipGenerator.clips.length > 0) && (
                <ClipProgressList
                  progress={clipGenerator.progress}
                  clips={clipGenerator.clips}
                  onDownload={clipGenerator.downloadClip}
                  driveConnected={driveConnected}
                  onConnectDrive={handleConnectDrive}
                  onSaveToDrive={handleSaveToDrive}
                />
              )}

              {clipGenerator.error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                  <p className="text-sm text-red-400">{clipGenerator.error}</p>
                </div>
              )}

              {/* Drive status banner */}
              {clipGenerator.clips.length > 0 && !clipGenerator.isGenerating && (
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3',
                    driveConnected
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-zinc-800 bg-zinc-900/50'
                  )}
                >
                  <Cloud
                    className={cn('h-5 w-5', driveConnected ? 'text-emerald-400' : 'text-zinc-500')}
                  />
                  <div className="flex-1">
                    <p
                      className={cn(
                        'text-sm',
                        driveConnected ? 'text-emerald-400' : 'text-zinc-400'
                      )}
                    >
                      {driveConnected
                        ? 'Conectado a Google Drive'
                        : 'Conecta Google Drive para autoguardar'}
                    </p>
                  </div>
                  {!driveConnected && (
                    <Button size="sm" variant="outline" onClick={handleConnectDrive}>
                      Conectar
                    </Button>
                  )}
                </div>
              )}

              {clipGenerator.clips.length > 1 && !clipGenerator.isGenerating && (
                <Button
                  onClick={clipGenerator.downloadAllClips}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4" />
                  Descargar todos los clips
                </Button>
              )}
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

          {currentStep !== 'generate' && (
            <Button
              size="default"
              className="sm:size-lg"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {currentStep === 'subtitles' ? (
                <>
                  <span className="hidden sm:inline">Siguiente</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Continuar</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}

          {currentStep === 'generate' &&
            clipGenerator.clips.length > 0 &&
            !clipGenerator.isGenerating && (
              <Button
                size="default"
                className="sm:size-lg"
                onClick={() => {
                  clipGenerator.reset();
                  handleClearAll();
                }}
              >
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Finalizar</span>
                <span className="sm:hidden">Listo</span>
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}
