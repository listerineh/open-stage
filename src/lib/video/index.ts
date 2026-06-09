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
  VIDEO_FORMATS,
  type VideoFormat,
  type SubtitleStyle,
  type GenerationConfig,
  type GeneratedClip,
  type GenerationProgress,
} from './clip-generator';
