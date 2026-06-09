/**
 * Clip Generator Service
 * Orchestrates the full clip generation pipeline
 */

import { loadFFmpeg, extractAudio, generateClip, addSubtitlesToClip } from './ffmpeg-service';
import { detectMoments, type DetectionConfig } from './moment-detection';
import { initTranscriber, transcribeAudio, destroyTranscriber } from '../transcription';
import { OUTPUT_FORMATS_MAP, type OutputFormat, type SubtitleSettings } from '../constants';

export interface GenerationConfig {
  videoUrl: string;
  formats: string[];
  intent: 'viral' | 'songs' | 'highlights' | 'funny';
  subtitles: SubtitleSettings;
  minClipDuration?: number;
  maxClipDuration?: number;
  targetClipCount?: number;
}

export interface GeneratedClip {
  id: string;
  name: string;
  format: OutputFormat;
  startTime: number;
  endTime: number;
  duration: number;
  blob: Blob;
  url: string;
  score: number;
  reason: string;
}

export interface GenerationProgress {
  stage:
    | 'loading'
    | 'extracting'
    | 'analyzing'
    | 'transcribing'
    | 'generating'
    | 'subtitles'
    | 'done'
    | 'error';
  progress: number;
  message: string;
  currentClip?: number;
  totalClips?: number;
}

type ProgressCallback = (progress: GenerationProgress) => void;

/**
 * Generate clips from a video URL
 */
export async function generateClips(
  config: GenerationConfig,
  onProgress?: ProgressCallback
): Promise<GeneratedClip[]> {
  const clips: GeneratedClip[] = [];

  try {
    // Stage 1: Load FFmpeg
    onProgress?.({
      stage: 'loading',
      progress: 0,
      message: 'Cargando procesador de video...',
    });

    await loadFFmpeg();

    // Stage 2: Extract audio
    onProgress?.({
      stage: 'extracting',
      progress: 10,
      message: 'Extrayendo audio del video...',
    });

    const audioBlob = await extractAudio(config.videoUrl);

    // Stage 3: Analyze audio for moments
    onProgress?.({
      stage: 'analyzing',
      progress: 25,
      message: 'Analizando momentos clave...',
    });

    const detectionConfig: DetectionConfig = {
      intent: config.intent,
      minClipDuration: config.minClipDuration || (config.intent === 'songs' ? 30 : 15),
      maxClipDuration: config.maxClipDuration || (config.intent === 'songs' ? 300 : 60),
      targetClipCount: config.targetClipCount || (config.intent === 'songs' ? 10 : 5),
    };

    const detection = await detectMoments(audioBlob, detectionConfig);
    const suggestions = detection.suggestedClips;

    if (suggestions.length === 0) {
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: 'No se encontraron momentos para generar clips',
      });
      return [];
    }

    // Stage 4: Transcribe if subtitles enabled
    let transcription: { text: string; start: number; end: number }[] = [];

    if (config.subtitles.enabled) {
      onProgress?.({
        stage: 'transcribing',
        progress: 35,
        message: 'Transcribiendo audio...',
      });

      try {
        await initTranscriber('tiny');
        const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
        const result = await transcribeAudio(
          audioFile,
          config.subtitles.language === 'auto' ? undefined : config.subtitles.language
        );
        transcription = result.segments.map(s => ({
          text: s.text,
          start: s.start,
          end: s.end,
        }));
        await destroyTranscriber();
      } catch (error) {
        console.warn('Transcription failed, continuing without subtitles:', error);
      }
    }

    // Stage 5: Generate clips for each format and suggestion
    const totalClips = suggestions.length * config.formats.length;
    let currentClip = 0;

    for (const suggestion of suggestions) {
      for (const formatId of config.formats) {
        const format = OUTPUT_FORMATS_MAP[formatId];
        if (!format) continue;

        currentClip++;
        const clipProgress = 45 + (currentClip / totalClips) * 45;

        onProgress?.({
          stage: 'generating',
          progress: clipProgress,
          message: `Generando clip ${currentClip} de ${totalClips}...`,
          currentClip,
          totalClips,
        });

        const clipId = `clip-${Date.now()}-${currentClip}`;
        const clipName = `${format.name} - ${formatTime(suggestion.start)}-${formatTime(suggestion.end)}`;

        // Generate the clip
        let clipBlob = await generateClip(config.videoUrl, {
          startTime: suggestion.start,
          endTime: suggestion.end,
          format: {
            id: format.id,
            width: format.resolution.width,
            height: format.resolution.height,
            aspectRatio: format.aspectRatio,
          },
          outputName: clipId,
        });

        // Add subtitles if enabled and we have transcription
        if (config.subtitles.enabled && transcription.length > 0) {
          onProgress?.({
            stage: 'subtitles',
            progress: clipProgress + 2,
            message: `Agregando subtítulos al clip ${currentClip}...`,
            currentClip,
            totalClips,
          });

          // Filter transcription segments for this clip
          const clipSegments = transcription
            .filter(s => s.start >= suggestion.start * 1000 && s.end <= suggestion.end * 1000)
            .map(s => ({
              text: s.text,
              start: s.start - suggestion.start * 1000,
              end: s.end - suggestion.start * 1000,
            }));

          if (clipSegments.length > 0) {
            try {
              clipBlob = await addSubtitlesToClip(clipBlob, clipSegments, {
                fontFamily: config.subtitles.style === 'bold' ? 'Impact' : 'Arial',
                fontSize: config.subtitles.style === 'bold' ? 32 : 24,
                color: 'white',
                position: config.subtitles.position,
              });
            } catch (error) {
              console.warn('Failed to add subtitles to clip:', error);
            }
          }
        }

        // Create object URL for preview
        const url = URL.createObjectURL(clipBlob);

        clips.push({
          id: clipId,
          name: clipName,
          format,
          startTime: suggestion.start,
          endTime: suggestion.end,
          duration: suggestion.end - suggestion.start,
          blob: clipBlob,
          url,
          score: suggestion.score,
          reason: suggestion.reason,
        });
      }
    }

    onProgress?.({
      stage: 'done',
      progress: 100,
      message: `${clips.length} clips generados`,
      currentClip: totalClips,
      totalClips,
    });

    return clips;
  } catch (error) {
    onProgress?.({
      stage: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : 'Error desconocido',
    });
    throw error;
  }
}

/**
 * Download a single clip
 */
export function downloadClip(clip: GeneratedClip): void {
  const a = document.createElement('a');
  a.href = clip.url;
  a.download = `${clip.name}.mp4`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Download all clips as a ZIP file
 */
export async function downloadAllClips(clips: GeneratedClip[]): Promise<void> {
  // Dynamic import JSZip only when needed
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  for (const clip of clips) {
    const arrayBuffer = await clip.blob.arrayBuffer();
    zip.file(`${clip.name}.mp4`, arrayBuffer);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `clips-${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

/**
 * Revoke all clip URLs to free memory
 */
export function revokeClipUrls(clips: GeneratedClip[]): void {
  for (const clip of clips) {
    URL.revokeObjectURL(clip.url);
  }
}

/**
 * Format time in MM:SS format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Estimate processing time based on video duration
 */
export function estimateProcessingTime(
  videoDurationSeconds: number,
  formatCount: number,
  withSubtitles: boolean
): number {
  // Base time: ~30s per minute of video
  let estimate = (videoDurationSeconds / 60) * 30;

  // Add time for each format
  estimate *= 1 + (formatCount - 1) * 0.3;

  // Add time for subtitles
  if (withSubtitles) {
    estimate *= 1.5;
  }

  return Math.round(estimate);
}
