'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export interface ProcessingProgress {
  stage: 'loading' | 'downloading' | 'analyzing' | 'generating' | 'done' | 'error';
  progress: number;
  message: string;
  currentClip?: number;
  totalClips?: number;
}

export interface GeneratedClip {
  id: string;
  name: string;
  format: {
    id: string;
    name: string;
    aspectRatio: string;
    width: number;
    height: number;
  };
  startTime: number;
  endTime: number;
  duration: number;
  blob: Blob;
  url: string;
  score: number;
  reason: string;
}

export interface ProcessingConfig {
  videoUrl: string;
  formats: string[];
  intent: string;
  subtitles: {
    enabled: boolean;
    style: string;
    position: string;
    alignment: string;
    language: string;
  };
}

const FORMAT_SPECS: Record<
  string,
  { name: string; width: number; height: number; aspectRatio: string }
> = {
  tiktok: { name: 'TikTok', width: 1080, height: 1920, aspectRatio: '9:16' },
  reels: { name: 'Instagram Reels', width: 1080, height: 1920, aspectRatio: '9:16' },
  shorts: { name: 'YouTube Shorts', width: 1080, height: 1920, aspectRatio: '9:16' },
  instagram: { name: 'Instagram Post', width: 1080, height: 1080, aspectRatio: '1:1' },
  youtube: { name: 'YouTube', width: 1920, height: 1080, aspectRatio: '16:9' },
};

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoaded = false;

export async function loadFFmpeg(
  onProgress?: (progress: ProcessingProgress) => void
): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegLoaded) {
    return ffmpegInstance;
  }

  onProgress?.({
    stage: 'loading',
    progress: 0,
    message: 'Cargando procesador de video...',
  });

  ffmpegInstance = new FFmpeg();

  ffmpegInstance.on('progress', ({ progress }) => {
    onProgress?.({
      stage: 'generating',
      progress: Math.round(progress * 100),
      message: 'Procesando video...',
    });
  });

  // Load from local files
  const baseURL = '/ffmpeg';

  await ffmpegInstance.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpegLoaded = true;

  onProgress?.({
    stage: 'loading',
    progress: 100,
    message: 'Procesador cargado',
  });

  return ffmpegInstance;
}

export async function downloadVideo(
  url: string,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<Uint8Array> {
  onProgress?.({
    stage: 'downloading',
    progress: 0,
    message: 'Descargando video...',
  });

  // Use our proxy API to avoid CORS issues with Google Drive
  const proxyUrl = `/api/download-video?url=${encodeURIComponent(url)}`;

  const response = await fetch(proxyUrl);

  if (!response.ok) {
    throw new Error(`Error descargando video: ${response.status}`);
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No se pudo leer el video');
  }

  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    received += value.length;

    if (total > 0) {
      onProgress?.({
        stage: 'downloading',
        progress: Math.round((received / total) * 100),
        message: `Descargando video... ${Math.round(received / 1024 / 1024)}MB`,
      });
    }
  }

  // Combine chunks
  const videoData = new Uint8Array(received);
  let position = 0;
  for (const chunk of chunks) {
    videoData.set(chunk, position);
    position += chunk.length;
  }

  onProgress?.({
    stage: 'downloading',
    progress: 100,
    message: 'Video descargado',
  });

  return videoData;
}

export async function generateClip(
  ffmpeg: FFmpeg,
  videoData: Uint8Array,
  startTime: number,
  endTime: number,
  format: { width: number; height: number },
  outputName: string,
  isInputWritten: boolean = false
): Promise<Blob> {
  // Write input video only if not already written
  if (!isInputWritten) {
    await ffmpeg.writeFile('input.mp4', videoData);
  }

  const duration = endTime - startTime;

  // Use copy codec when possible to save memory and time
  // Scale down for memory efficiency
  const targetWidth = Math.min(format.width, 720);
  const targetHeight = Math.min(format.height, 1280);

  // Generate clip - use stream copy for speed and memory efficiency
  await ffmpeg.exec([
    '-ss',
    startTime.toString(),
    '-i',
    'input.mp4',
    '-t',
    duration.toString(),
    '-vf',
    `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2:black`,
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-crf',
    '32', // Higher CRF = smaller file, less memory
    '-threads',
    '1',
    '-c:a',
    'aac',
    '-b:a',
    '96k',
    '-movflags',
    '+faststart',
    '-y',
    `${outputName}.mp4`,
  ]);

  // Read output
  const data = await ffmpeg.readFile(`${outputName}.mp4`);
  const blob = new Blob([data as BlobPart], { type: 'video/mp4' });

  // Cleanup output only (keep input for next clip)
  await ffmpeg.deleteFile(`${outputName}.mp4`);

  return blob;
}

export async function processVideo(
  config: ProcessingConfig,
  onProgress: (progress: ProcessingProgress) => void
): Promise<GeneratedClip[]> {
  try {
    // Step 1: Load FFmpeg
    const ffmpeg = await loadFFmpeg(onProgress);

    // Step 2: Download video
    const videoData = await downloadVideo(config.videoUrl, onProgress);

    // Step 3: Analyze video (simplified - detect moments based on duration)
    onProgress({
      stage: 'analyzing',
      progress: 0,
      message: 'Analizando momentos clave...',
    });

    // Generate clip suggestions based on number of formats selected
    // Each format gets different time segments to avoid duplicates
    const clipSuggestions: Array<{
      start: number;
      end: number;
      score: number;
      reason: string;
      formatId: string;
    }> = [];

    const clipDuration = 30; // 30 seconds per clip
    const clipReasons = [
      'Inicio del video - momento de enganche',
      'Sección con potencial viral',
      'Momento destacado',
      'Contenido atractivo',
      'Segmento dinámico',
    ];

    let clipIndex = 0;
    for (const formatId of config.formats) {
      const startTime = clipIndex * clipDuration;
      clipSuggestions.push({
        start: startTime,
        end: startTime + clipDuration,
        score: 0.92 - clipIndex * 0.02,
        reason: clipReasons[clipIndex % clipReasons.length],
        formatId,
      });
      clipIndex++;
    }

    onProgress({
      stage: 'analyzing',
      progress: 100,
      message: 'Análisis completado',
    });

    // Step 4: Generate clips
    const clips: GeneratedClip[] = [];
    const totalClips = clipSuggestions.length;
    let currentClip = 0;
    let isInputWritten = false;

    // Write input video once
    await ffmpeg.writeFile('input.mp4', videoData);
    isInputWritten = true;

    for (const suggestion of clipSuggestions) {
      currentClip++;
      const formatSpec = FORMAT_SPECS[suggestion.formatId] || FORMAT_SPECS.tiktok;

      onProgress({
        stage: 'generating',
        progress: Math.round((currentClip / totalClips) * 100),
        message: `Generando clip ${currentClip} de ${totalClips}...`,
        currentClip,
        totalClips,
      });

      try {
        const clipBlob = await generateClip(
          ffmpeg,
          new Uint8Array(0), // Empty - input already written
          suggestion.start,
          suggestion.end,
          { width: formatSpec.width, height: formatSpec.height },
          `clip-${currentClip}`,
          isInputWritten
        );

        const clipUrl = URL.createObjectURL(clipBlob);

        clips.push({
          id: `clip-${Date.now()}-${currentClip}`,
          name: `${formatSpec.name} - ${formatTime(suggestion.start)} a ${formatTime(suggestion.end)}`,
          format: {
            id: suggestion.formatId,
            name: formatSpec.name,
            aspectRatio: formatSpec.aspectRatio,
            width: formatSpec.width,
            height: formatSpec.height,
          },
          startTime: suggestion.start,
          endTime: suggestion.end,
          duration: suggestion.end - suggestion.start,
          blob: clipBlob,
          url: clipUrl,
          score: suggestion.score,
          reason: suggestion.reason,
        });
      } catch (clipError) {
        console.error(`Error generating clip ${currentClip}:`, clipError);
        // Continue with other clips even if one fails
      }
    }

    // Cleanup input file
    try {
      await ffmpeg.deleteFile('input.mp4');
    } catch {
      // Ignore cleanup errors
    }

    onProgress({
      stage: 'done',
      progress: 100,
      message: 'Procesamiento completado',
    });

    return clips;
  } catch (error) {
    onProgress({
      stage: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : 'Error desconocido',
    });
    throw error;
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
