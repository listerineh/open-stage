'use client';

import { useState, useCallback, useRef } from 'react';
import { type AudioMoment } from '@/lib/audio';
import {
  type ClipResult,
  type ClipProgress,
  type GeneratorState,
  type ClipConfig,
  CLIP_FORMATS,
  generateClipFilename,
} from '@/lib/clip-generator/types';
export { generateClipFilename };
import { generateClipConfigs } from '@/lib/clip-generator/duration';
import { generateMultipleClips } from '@/lib/clip-generator/ffmpeg-worker';

const initialState: GeneratorState = {
  isGenerating: false,
  currentClip: 0,
  totalClips: 0,
  clips: [],
  progress: [],
  error: null,
};

export function useClipGenerator() {
  const [state, setState] = useState<GeneratorState>(initialState);
  const abortRef = useRef(false);
  const videoNameRef = useRef<string>('video');

  const generate = useCallback(
    async (
      videoUrl: string,
      moments: AudioMoment[],
      selectedIndices: number[],
      videoDuration: number,
      formatIds: string[],
      videoName: string = 'video'
    ) => {
      if (state.isGenerating) return;

      abortRef.current = false;
      videoNameRef.current = videoName;

      // Generar configs para cada formato seleccionado
      const allConfigs: (ClipConfig & { formatId: string })[] = [];
      for (const formatId of formatIds) {
        const format = CLIP_FORMATS.find(f => f.id === formatId) || CLIP_FORMATS[0];
        const configs = generateClipConfigs(moments, selectedIndices, videoDuration, format);
        configs.forEach(c => allConfigs.push({ ...c, formatId }));
      }

      // Crear progreso inicial para cada clip de cada formato
      const initialProgress: ClipProgress[] = allConfigs.map(c => ({
        id: `${c.formatId}-${c.momentIndex}`,
        momentIndex: c.momentIndex,
        formatId: c.formatId,
        stage: 'queued' as const,
        progress: 0,
        message: `En cola (${c.format.name})...`,
      }));

      setState({
        isGenerating: true,
        currentClip: 0,
        totalClips: allConfigs.length,
        clips: [],
        progress: initialProgress,
        error: null,
      });

      const fileIdMatch = videoUrl.match(/\/d\/([^/]+)/);
      if (!fileIdMatch) {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: 'URL de video inválida',
        }));
        return;
      }

      const downloadUrl = `/api/download-video?fileId=${fileIdMatch[1]}`;

      try {
        // Procesar por formato para reutilizar el video descargado
        let clipNumber = 1;
        for (const formatId of formatIds) {
          if (abortRef.current) break;

          const formatConfigs = allConfigs.filter(c => c.formatId === formatId);

          await generateMultipleClips(
            downloadUrl,
            formatConfigs,
            formatId,
            (progress: ClipProgress) => {
              if (abortRef.current) return;

              setState(prev => ({
                ...prev,
                progress: prev.progress.map(p => (p.id === progress.id ? progress : p)),
                currentClip: progress.stage === 'done' ? prev.currentClip + 1 : prev.currentClip,
              }));
            },
            (momentIndex: number, blob: Blob, config: ClipConfig) => {
              if (abortRef.current) return;

              const result: ClipResult = {
                id: `clip-${formatId}-${momentIndex}-${Date.now()}`,
                momentIndex,
                clipNumber: clipNumber++,
                blob,
                url: URL.createObjectURL(blob),
                duration: config.duration,
                format: config.format,
                timestamp: config.moment.timestamp,
                videoName,
              };

              setState(prev => ({
                ...prev,
                clips: [...prev.clips, result],
              }));
            }
          );
        }

        setState(prev => ({
          ...prev,
          isGenerating: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: error instanceof Error ? error.message : 'Error generando clips',
        }));
      }
    },
    [state.isGenerating]
  );

  const abort = useCallback(() => {
    abortRef.current = true;
    setState(prev => ({
      ...prev,
      isGenerating: false,
      error: 'Generación cancelada',
    }));
  }, []);

  const reset = useCallback(() => {
    state.clips.forEach(clip => {
      URL.revokeObjectURL(clip.url);
    });
    setState(initialState);
  }, [state.clips]);

  const downloadClip = useCallback((clip: ClipResult) => {
    const filename = generateClipFilename(
      clip.videoName,
      clip.clipNumber,
      clip.timestamp,
      clip.format.id
    );
    const a = document.createElement('a');
    a.href = clip.url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const downloadAllClips = useCallback(() => {
    state.clips.forEach((clip, index) => {
      setTimeout(() => {
        downloadClip(clip);
      }, index * 500);
    });
  }, [state.clips, downloadClip]);

  return {
    ...state,
    generate,
    abort,
    reset,
    downloadClip,
    downloadAllClips,
    formats: CLIP_FORMATS,
  };
}
