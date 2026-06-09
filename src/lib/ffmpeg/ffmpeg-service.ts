import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

function toBlob(data: Uint8Array, type: string): Blob {
  // Create a new ArrayBuffer copy to avoid SharedArrayBuffer issues
  const buffer = new ArrayBuffer(data.length);
  const view = new Uint8Array(buffer);
  view.set(data);
  return new Blob([buffer], { type });
}

export interface ClipConfig {
  startTime: number;
  endTime: number;
  format: {
    id: string;
    width: number;
    height: number;
    aspectRatio: string;
  };
  outputName: string;
}

export interface ProcessingProgress {
  status: 'loading' | 'processing' | 'done' | 'error';
  progress: number;
  message: string;
  currentClip?: number;
  totalClips?: number;
}

type ProgressCallback = (progress: ProcessingProgress) => void;

let ffmpeg: FFmpeg | null = null;
let isLoaded = false;

export async function loadFFmpeg(onProgress?: ProgressCallback): Promise<void> {
  if (isLoaded && ffmpeg) return;

  onProgress?.({
    status: 'loading',
    progress: 0,
    message: 'Cargando FFmpeg...',
  });

  ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });

  ffmpeg.on('progress', ({ progress }) => {
    onProgress?.({
      status: 'processing',
      progress: Math.round(progress * 100),
      message: `Procesando... ${Math.round(progress * 100)}%`,
    });
  });

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  isLoaded = true;

  onProgress?.({
    status: 'done',
    progress: 100,
    message: 'FFmpeg cargado',
  });
}

export async function extractAudio(videoUrl: string, onProgress?: ProgressCallback): Promise<Blob> {
  if (!ffmpeg || !isLoaded) {
    await loadFFmpeg(onProgress);
  }

  onProgress?.({
    status: 'processing',
    progress: 0,
    message: 'Descargando video...',
  });

  const videoData = await fetchFile(videoUrl);
  await ffmpeg!.writeFile('input.mp4', videoData);

  onProgress?.({
    status: 'processing',
    progress: 10,
    message: 'Extrayendo audio...',
  });

  await ffmpeg!.exec([
    '-i',
    'input.mp4',
    '-vn',
    '-acodec',
    'pcm_s16le',
    '-ar',
    '16000',
    '-ac',
    '1',
    'output.wav',
  ]);

  const audioData = (await ffmpeg!.readFile('output.wav')) as Uint8Array;
  const audioBlob = toBlob(audioData, 'audio/wav');

  // Cleanup
  await ffmpeg!.deleteFile('input.mp4');
  await ffmpeg!.deleteFile('output.wav');

  onProgress?.({
    status: 'done',
    progress: 100,
    message: 'Audio extraído',
  });

  return audioBlob;
}

export async function generateClip(
  videoUrl: string,
  config: ClipConfig,
  onProgress?: ProgressCallback
): Promise<Blob> {
  if (!ffmpeg || !isLoaded) {
    await loadFFmpeg(onProgress);
  }

  onProgress?.({
    status: 'processing',
    progress: 0,
    message: 'Preparando clip...',
  });

  const videoData = await fetchFile(videoUrl);
  await ffmpeg!.writeFile('input.mp4', videoData);

  const duration = config.endTime - config.startTime;
  const { width, height } = config.format;

  onProgress?.({
    status: 'processing',
    progress: 20,
    message: `Generando clip ${config.outputName}...`,
  });

  // Generate clip with crop/scale to target aspect ratio
  await ffmpeg!.exec([
    '-i',
    'input.mp4',
    '-ss',
    config.startTime.toString(),
    '-t',
    duration.toString(),
    '-vf',
    `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
    '-c:v',
    'libx264',
    '-preset',
    'fast',
    '-crf',
    '23',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    `${config.outputName}.mp4`,
  ]);

  const clipData = (await ffmpeg!.readFile(`${config.outputName}.mp4`)) as Uint8Array;
  const clipBlob = toBlob(clipData, 'video/mp4');

  // Cleanup
  await ffmpeg!.deleteFile('input.mp4');
  await ffmpeg!.deleteFile(`${config.outputName}.mp4`);

  onProgress?.({
    status: 'done',
    progress: 100,
    message: 'Clip generado',
  });

  return clipBlob;
}

export async function generateMultipleClips(
  videoUrl: string,
  clips: ClipConfig[],
  onProgress?: ProgressCallback
): Promise<Map<string, Blob>> {
  if (!ffmpeg || !isLoaded) {
    await loadFFmpeg(onProgress);
  }

  const results = new Map<string, Blob>();

  onProgress?.({
    status: 'processing',
    progress: 0,
    message: 'Descargando video...',
    currentClip: 0,
    totalClips: clips.length,
  });

  const videoData = await fetchFile(videoUrl);
  await ffmpeg!.writeFile('input.mp4', videoData);

  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const progress = Math.round(((i + 1) / clips.length) * 100);

    onProgress?.({
      status: 'processing',
      progress,
      message: `Generando clip ${i + 1} de ${clips.length}...`,
      currentClip: i + 1,
      totalClips: clips.length,
    });

    const duration = clip.endTime - clip.startTime;
    const { width, height } = clip.format;

    await ffmpeg!.exec([
      '-i',
      'input.mp4',
      '-ss',
      clip.startTime.toString(),
      '-t',
      duration.toString(),
      '-vf',
      `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '23',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      `${clip.outputName}.mp4`,
    ]);

    const clipData = (await ffmpeg!.readFile(`${clip.outputName}.mp4`)) as Uint8Array;
    const clipBlob = toBlob(clipData, 'video/mp4');
    results.set(clip.outputName, clipBlob);

    await ffmpeg!.deleteFile(`${clip.outputName}.mp4`);
  }

  // Cleanup input
  await ffmpeg!.deleteFile('input.mp4');

  onProgress?.({
    status: 'done',
    progress: 100,
    message: `${clips.length} clips generados`,
    currentClip: clips.length,
    totalClips: clips.length,
  });

  return results;
}

export async function addSubtitlesToClip(
  videoBlob: Blob,
  subtitles: { text: string; start: number; end: number }[],
  style: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    position?: 'top' | 'center' | 'bottom';
  } = {},
  onProgress?: ProgressCallback
): Promise<Blob> {
  if (!ffmpeg || !isLoaded) {
    await loadFFmpeg(onProgress);
  }

  const { fontFamily = 'Arial', fontSize = 24, color = 'white', position = 'bottom' } = style;

  // Generate ASS subtitle file
  const assContent = generateASSSubtitles(subtitles, {
    fontFamily,
    fontSize,
    color,
    position,
  });

  await ffmpeg!.writeFile('input.mp4', new Uint8Array(await videoBlob.arrayBuffer()));
  await ffmpeg!.writeFile('subtitles.ass', assContent);

  onProgress?.({
    status: 'processing',
    progress: 50,
    message: 'Agregando subtítulos...',
  });

  await ffmpeg!.exec(['-i', 'input.mp4', '-vf', 'ass=subtitles.ass', '-c:a', 'copy', 'output.mp4']);

  const outputData = (await ffmpeg!.readFile('output.mp4')) as Uint8Array;
  const outputBlob = toBlob(outputData, 'video/mp4');

  // Cleanup
  await ffmpeg!.deleteFile('input.mp4');
  await ffmpeg!.deleteFile('subtitles.ass');
  await ffmpeg!.deleteFile('output.mp4');

  onProgress?.({
    status: 'done',
    progress: 100,
    message: 'Subtítulos agregados',
  });

  return outputBlob;
}

function generateASSSubtitles(
  subtitles: { text: string; start: number; end: number }[],
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
    position: 'top' | 'center' | 'bottom';
  }
): string {
  const alignment = style.position === 'top' ? 8 : style.position === 'center' ? 5 : 2;
  const marginV = style.position === 'top' ? 20 : style.position === 'center' ? 0 : 20;

  const header = `[Script Info]
Title: Generated Subtitles
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${style.fontFamily},${style.fontSize},&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,2,1,${alignment},10,10,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = subtitles
    .map(sub => {
      const startTime = formatASSTime(sub.start / 1000);
      const endTime = formatASSTime(sub.end / 1000);
      return `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${sub.text}`;
    })
    .join('\n');

  return header + events;
}

function formatASSTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

export function isFFmpegLoaded(): boolean {
  return isLoaded;
}

export function unloadFFmpeg(): void {
  if (ffmpeg) {
    ffmpeg = null;
    isLoaded = false;
  }
}
