/**
 * Video-related constants
 * Centralized configuration for video formats, intents, and subtitles
 */

import type { LucideIcon } from 'lucide-react';

// =============================================================================
// OUTPUT FORMATS
// =============================================================================

export interface OutputFormat {
  id: string;
  name: string;
  platform: string;
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  idealDuration: number; // Duración ideal para clips en este formato
  maxDuration: number;
  resolution: { width: number; height: number };
  iconName: 'Music' | 'Camera' | 'Play' | 'Tv' | 'Grid' | 'Circle';
}

export const OUTPUT_FORMATS: OutputFormat[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    platform: 'TikTok',
    aspectRatio: '9:16',
    idealDuration: 30, // ~30s ideal para engagement
    maxDuration: 180, // 3 min
    resolution: { width: 1080, height: 1920 },
    iconName: 'Music',
  },
  {
    id: 'reels',
    name: 'Instagram Reels',
    platform: 'Instagram',
    aspectRatio: '9:16',
    idealDuration: 30, // ~30s ideal
    maxDuration: 90, // 1.5 min
    resolution: { width: 1080, height: 1920 },
    iconName: 'Camera',
  },
  {
    id: 'shorts',
    name: 'YouTube Shorts',
    platform: 'YouTube',
    aspectRatio: '9:16',
    idealDuration: 45, // ~45s ideal
    maxDuration: 60, // 1 min
    resolution: { width: 1080, height: 1920 },
    iconName: 'Play',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    platform: 'Instagram',
    aspectRatio: '9:16',
    idealDuration: 15, // 15s (límite de story)
    maxDuration: 15,
    resolution: { width: 1080, height: 1920 },
    iconName: 'Circle',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    platform: 'YouTube',
    aspectRatio: '16:9',
    idealDuration: 120, // ~2 min ideal para clips
    maxDuration: 600, // 10 min
    resolution: { width: 1920, height: 1080 },
    iconName: 'Tv',
  },
  {
    id: 'instagram-feed',
    name: 'Instagram Feed',
    platform: 'Instagram',
    aspectRatio: '1:1',
    idealDuration: 30, // ~30s ideal
    maxDuration: 60, // 1 min
    resolution: { width: 1080, height: 1080 },
    iconName: 'Grid',
  },
];

export const OUTPUT_FORMATS_MAP = Object.fromEntries(OUTPUT_FORMATS.map(f => [f.id, f])) as Record<
  string,
  OutputFormat
>;

// =============================================================================
// VIDEO INTENTS
// =============================================================================

export interface VideoIntent {
  id: 'viral' | 'songs' | 'highlights' | 'funny';
  name: string;
  description: string;
  iconName: 'Zap' | 'Music' | 'Star' | 'Laugh';
  examples: string[];
}

export const VIDEO_INTENTS: VideoIntent[] = [
  {
    id: 'viral',
    name: 'Clips virales',
    description: 'Momentos de alta energía y engagement',
    iconName: 'Zap',
    examples: ['Solos épicos', 'Drops', 'Reacciones del público'],
  },
  {
    id: 'songs',
    name: 'Canciones completas',
    description: 'Cada canción como un clip separado',
    iconName: 'Music',
    examples: ['Covers', 'Canciones originales', 'Setlist completo'],
  },
  {
    id: 'highlights',
    name: 'Mejores momentos',
    description: 'Los puntos más destacados del video',
    iconName: 'Star',
    examples: ['Momentos clave', 'Aplausos', 'Interacción con fans'],
  },
  {
    id: 'funny',
    name: 'Momentos divertidos',
    description: 'Risas, fails y reacciones espontáneas',
    iconName: 'Laugh',
    examples: ['Bloopers', 'Chistes', 'Momentos inesperados'],
  },
];

export type VideoIntentId = VideoIntent['id'];

// =============================================================================
// SUBTITLE SETTINGS
// =============================================================================

export interface SubtitleStyle {
  id: 'minimal' | 'bold' | 'karaoke' | 'outline';
  name: string;
  description: string;
  preview: string;
}

export const SUBTITLE_STYLES: SubtitleStyle[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Texto limpio y simple',
    preview: 'font-normal text-white',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Texto grande y llamativo',
    preview: 'font-bold text-white text-lg',
  },
  {
    id: 'karaoke',
    name: 'Karaoke',
    description: 'Resaltado palabra por palabra',
    preview: 'font-semibold text-yellow-400',
  },
  {
    id: 'outline',
    name: 'Outline',
    description: 'Con borde para mejor lectura',
    preview: 'font-semibold text-white [text-shadow:_2px_2px_0_#000]',
  },
];

export type SubtitleStyleId = SubtitleStyle['id'];

export interface Language {
  code: string;
  name: string;
}

export const LANGUAGES: Language[] = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'auto', name: 'Detectar automáticamente' },
];

export interface SubtitleSettings {
  enabled: boolean;
  style: SubtitleStyleId;
  position: 'top' | 'center' | 'bottom';
  alignment: 'left' | 'center' | 'right';
  language: string;
}

export const DEFAULT_SUBTITLE_SETTINGS: SubtitleSettings = {
  enabled: true,
  style: 'bold',
  position: 'bottom',
  alignment: 'center',
  language: 'auto',
};

// =============================================================================
// ICON MAPPING (for use in components)
// =============================================================================

export const FORMAT_ICONS: Record<OutputFormat['iconName'], LucideIcon> = {} as Record<
  OutputFormat['iconName'],
  LucideIcon
>;

export const INTENT_ICONS: Record<VideoIntent['iconName'], LucideIcon> = {} as Record<
  VideoIntent['iconName'],
  LucideIcon
>;

// Helper to get format by ID
export function getFormatById(id: string): OutputFormat | undefined {
  return OUTPUT_FORMATS_MAP[id];
}

// Helper to get intent by ID
export function getIntentById(id: VideoIntentId): VideoIntent | undefined {
  return VIDEO_INTENTS.find(i => i.id === id);
}
