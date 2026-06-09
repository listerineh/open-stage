export {
  loadFFmpeg,
  downloadVideo,
  generateClip,
  processVideo,
  type ProcessingProgress,
  type ProcessingConfig,
  type GeneratedClip,
} from './video-processor-client';

// Re-export constants for convenience
export {
  OUTPUT_FORMATS,
  OUTPUT_FORMATS_MAP,
  VIDEO_INTENTS,
  SUBTITLE_STYLES,
  LANGUAGES,
  DEFAULT_SUBTITLE_SETTINGS,
  type OutputFormat,
  type VideoIntent,
  type VideoIntentId,
  type SubtitleStyle,
  type SubtitleSettings,
  type SubtitleStyleId,
  type Language,
} from '../constants';
