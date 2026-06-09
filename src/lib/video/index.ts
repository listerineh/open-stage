export {
  loadFFmpeg,
  extractAudio,
  generateClip,
  generateMultipleClips,
  addSubtitlesToClip,
  isFFmpegLoaded,
  unloadFFmpeg,
  type ClipConfig,
  type ProcessingProgress,
} from './ffmpeg-service';

export {
  detectMoments,
  quickDetect,
  type AudioMoment,
  type DetectionConfig,
  type DetectionResult,
  type ClipSuggestion,
} from './moment-detection';

export {
  generateClips,
  downloadClip,
  downloadAllClips,
  revokeClipUrls,
  estimateProcessingTime,
  type GenerationConfig,
  type GeneratedClip,
  type GenerationProgress,
} from './clip-generator';

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
