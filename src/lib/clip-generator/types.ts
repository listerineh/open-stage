import { type AudioMoment } from '@/lib/audio';
import { OUTPUT_FORMATS } from '@/lib/constants';

export interface ClipConfig {
  moment: AudioMoment;
  momentIndex: number;
  startTime: number;
  endTime: number;
  duration: number;
  format: ClipFormat;
}

export interface ClipFormat {
  id: string;
  name: string;
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  width: number;
  height: number;
  idealDuration: number; // Duración ideal para este formato
  maxDuration: number;
}

export interface ClipResult {
  id: string;
  momentIndex: number;
  clipNumber: number;
  blob: Blob;
  url: string;
  duration: number;
  format: ClipFormat;
  timestamp: number;
  videoName: string;
}

export interface ClipProgress {
  id: string; // Unique: `${formatId}-${momentIndex}`
  momentIndex: number;
  formatId: string;
  stage: 'queued' | 'downloading' | 'processing' | 'encoding' | 'done' | 'error';
  progress: number;
  message: string;
}

export function formatTimestampForFilename(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m${secs}s`;
}

export function generateClipFilename(
  videoName: string,
  clipNumber: number,
  timestamp: number,
  formatId: string
): string {
  const cleanName = videoName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9-_]/g, '_') // Replace special chars
    .substring(0, 30); // Limit length
  const ts = formatTimestampForFilename(timestamp);
  return `${cleanName}_clip${clipNumber}_${ts}_${formatId}.mp4`;
}

export interface GeneratorState {
  isGenerating: boolean;
  currentClip: number;
  totalClips: number;
  clips: ClipResult[];
  progress: ClipProgress[];
  error: string | null;
}

// Derivar CLIP_FORMATS de OUTPUT_FORMATS para mantener sincronizados
export const CLIP_FORMATS: ClipFormat[] = OUTPUT_FORMATS.map(f => ({
  id: f.id,
  name: f.name,
  aspectRatio: f.aspectRatio,
  width: f.resolution.width,
  height: f.resolution.height,
  idealDuration: f.idealDuration,
  maxDuration: f.maxDuration,
}));

export const DURATION_BY_MOMENT_TYPE: Record<
  AudioMoment['type'],
  { min: number; ideal: number; max: number }
> = {
  peak: { min: 15, ideal: 30, max: 45 },
  silence: { min: 10, ideal: 20, max: 30 },
  transition: { min: 20, ideal: 40, max: 60 },
};
