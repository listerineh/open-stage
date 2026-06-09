import { FileTranscriber, type TranscribeResult } from '@transcribe/transcriber';

export interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
}

export interface TranscriptionResult {
  language: string;
  segments: TranscriptionSegment[];
  fullText: string;
}

export interface TranscriptionProgress {
  status: 'loading-model' | 'transcribing' | 'done' | 'error';
  progress?: number;
  message?: string;
}

type ProgressCallback = (progress: TranscriptionProgress) => void;

const MODEL_URLS = {
  tiny: '/models/ggml-tiny-q5_1.bin',
  base: '/models/ggml-base-q5_1.bin',
  small: '/models/ggml-small-q5_1.bin',
} as const;

export type ModelSize = keyof typeof MODEL_URLS;

let transcriber: FileTranscriber | null = null;
let currentModel: ModelSize | null = null;

export async function initTranscriber(
  modelSize: ModelSize = 'tiny',
  onProgress?: ProgressCallback
): Promise<void> {
  if (transcriber && currentModel === modelSize) {
    return;
  }

  onProgress?.({ status: 'loading-model', message: `Cargando modelo ${modelSize}...` });

  try {
    const createModule = (await import('@transcribe/shout')).default;

    transcriber = new FileTranscriber({
      createModule,
      model: MODEL_URLS[modelSize],
    });

    await transcriber.init();
    currentModel = modelSize;

    onProgress?.({ status: 'done', message: 'Modelo cargado' });
  } catch (error) {
    onProgress?.({ status: 'error', message: 'Error cargando el modelo' });
    throw error;
  }
}

export async function transcribeAudio(
  audioFile: File | string,
  language: string = 'auto',
  onProgress?: ProgressCallback
): Promise<TranscriptionResult> {
  if (!transcriber) {
    throw new Error('Transcriber not initialized. Call initTranscriber first.');
  }

  onProgress?.({ status: 'transcribing', progress: 0, message: 'Transcribiendo...' });

  try {
    const result: TranscribeResult = await transcriber.transcribe(audioFile, {
      lang: language === 'auto' ? undefined : language,
    });

    const segments: TranscriptionSegment[] = result.transcription.map(seg => ({
      text: seg.text.trim(),
      start: seg.offsets.from,
      end: seg.offsets.to,
    }));

    const fullText = segments.map(s => s.text).join(' ');

    onProgress?.({ status: 'done', progress: 100, message: 'Transcripción completada' });

    return {
      language: result.result.language,
      segments,
      fullText,
    };
  } catch (error) {
    onProgress?.({ status: 'error', message: 'Error en la transcripción' });
    throw error;
  }
}

export function destroyTranscriber(): void {
  if (transcriber) {
    transcriber = null;
    currentModel = null;
  }
}
