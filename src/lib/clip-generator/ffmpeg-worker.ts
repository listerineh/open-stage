import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { type ClipConfig, type ClipProgress } from './types';

let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;
// Callback mutable para progreso por clip
const progressState = {
  callback: null as ((progress: number) => void) | null,
};

async function loadFFmpeg(onProgress: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpeg && ffmpegLoaded) {
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });

  // Progreso dinámico - se actualiza por clip
  ffmpeg.on('progress', ({ progress }) => {
    if (progressState.callback && progress >= 0 && progress <= 1) {
      progressState.callback(progress);
    }
  });

  onProgress('Cargando FFmpeg...');

  // Cargar desde archivos locales (más rápido que CDN)
  const baseURL = '/ffmpeg';

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpegLoaded = true;
  onProgress('FFmpeg listo');
  return ffmpeg;
}

async function downloadVideoData(
  url: string,
  onProgress: (received: number, total: number) => void
): Promise<Uint8Array> {
  const response = await fetch(url);

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
    onProgress(received, total);
  }

  const videoData = new Uint8Array(received);
  let position = 0;
  for (const chunk of chunks) {
    videoData.set(chunk, position);
    position += chunk.length;
  }

  return videoData;
}

async function generateSingleClip(
  ff: FFmpeg,
  config: ClipConfig & { formatId: string },
  onProgress: (progress: ClipProgress) => void
): Promise<Blob> {
  const { momentIndex, startTime, duration, format, formatId } = config;
  const progressId = `${formatId}-${momentIndex}`;

  onProgress({
    id: progressId,
    momentIndex,
    formatId,
    stage: 'processing',
    progress: 0,
    message: `Preparando clip (${format.name})...`,
  });

  const outputName = `clip_${momentIndex}.mp4`;

  // Optimizado para memoria: 720p max, ultrafast, CRF 32
  const targetWidth = Math.min(format.width, 720);
  const targetHeight = Math.min(format.height, 1280);

  // -ss después de -i para corte preciso (más lento pero exacto)
  const ffmpegArgs = [
    '-i',
    'input.mp4',
    '-ss',
    startTime.toString(),
    '-t',
    duration.toString(),
    '-vf',
    `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2:black`,
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-crf',
    '32',
    '-threads',
    '1',
    '-c:a',
    'aac',
    '-b:a',
    '96k',
    '-movflags',
    '+faststart',
    '-y',
    outputName,
  ];

  // Configurar callback de progreso para este clip
  progressState.callback = (progress: number) => {
    const percent = Math.round(progress * 100);
    onProgress({
      id: progressId,
      momentIndex,
      formatId,
      stage: 'encoding',
      progress: percent,
      message: `Codificando (${format.name})... ${percent}%`,
    });
  };

  await ff.exec(ffmpegArgs);

  // Limpiar callback
  progressState.callback = null;

  onProgress({
    id: progressId,
    momentIndex,
    formatId,
    stage: 'encoding',
    progress: 95,
    message: 'Finalizando...',
  });

  const data = await ff.readFile(outputName);
  const blob = new Blob([data as BlobPart], { type: 'video/mp4' });

  // Solo eliminar output, mantener input para siguiente clip
  await ff.deleteFile(outputName);

  onProgress({
    id: progressId,
    momentIndex,
    formatId,
    stage: 'done',
    progress: 100,
    message: `Clip generado (${format.name})`,
  });

  return blob;
}

export async function generateMultipleClips(
  videoUrl: string,
  configs: (ClipConfig & { formatId: string })[],
  formatId: string,
  onProgress: (progress: ClipProgress) => void,
  onClipComplete: (momentIndex: number, blob: Blob, config: ClipConfig) => void
): Promise<void> {
  const firstConfig = configs[0];
  if (!firstConfig) return;

  const firstProgressId = `${formatId}-${firstConfig.momentIndex}`;

  // Cargar FFmpeg una sola vez
  const ff = await loadFFmpeg(msg => {
    onProgress({
      id: firstProgressId,
      momentIndex: firstConfig.momentIndex,
      formatId,
      stage: 'downloading',
      progress: 5,
      message: msg,
    });
  });

  // Descargar video una sola vez
  onProgress({
    id: firstProgressId,
    momentIndex: firstConfig.momentIndex,
    formatId,
    stage: 'downloading',
    progress: 10,
    message: 'Descargando video...',
  });

  const videoData = await downloadVideoData(videoUrl, (received, total) => {
    const progress = total > 0 ? Math.round((received / total) * 100) : 0;
    onProgress({
      id: firstProgressId,
      momentIndex: firstConfig.momentIndex,
      formatId,
      stage: 'downloading',
      progress: Math.min(progress, 25),
      message: `Descargando... ${Math.round(received / 1024 / 1024)}MB`,
    });
  });

  // Escribir input una sola vez
  await ff.writeFile('input.mp4', videoData);

  // Generar cada clip reutilizando el input
  for (const config of configs) {
    const progressId = `${formatId}-${config.momentIndex}`;
    try {
      const blob = await generateSingleClip(ff, config, onProgress);
      onClipComplete(config.momentIndex, blob, config);
    } catch (error) {
      console.error(`Error generating clip ${config.momentIndex}:`, error);
      onProgress({
        id: progressId,
        momentIndex: config.momentIndex,
        formatId,
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  // Limpiar input al final
  try {
    await ff.deleteFile('input.mp4');
  } catch {
    // Ignorar errores de limpieza
  }
}
