/**
 * Audio Analysis Utilities
 * Uses Web Audio API to detect interesting moments in audio
 */

export interface AudioMoment {
  timestamp: number;
  type: 'peak' | 'silence' | 'transition';
  energy: number;
  confidence: number;
  duration?: number;
}

export interface AudioAnalysisResult {
  moments: AudioMoment[];
  averageEnergy: number;
  peakEnergy: number;
  duration: number;
  audioUrl: string; // Blob URL para preview
}

interface AnalysisOptions {
  peakThreshold?: number;
  silenceThreshold?: number;
  transitionThreshold?: number;
  windowSize?: number;
  hopSize?: number;
}

const DEFAULT_OPTIONS: Required<AnalysisOptions> = {
  peakThreshold: 0.75, // Increased to get only strong peaks
  silenceThreshold: 0.08, // Decreased to get only deep silences
  transitionThreshold: 0.4, // Increased to get only significant transitions
  windowSize: 2048,
  hopSize: 512,
};

/**
 * Analyze audio from a video URL using Web Audio API
 */
export async function analyzeAudio(
  videoUrl: string,
  options: AnalysisOptions = {}
): Promise<AudioAnalysisResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Extract Google Drive file ID from URL
    const fileIdMatch = videoUrl.match(/\/d\/([^/]+)/);
    if (!fileIdMatch) {
      throw new Error('Invalid Google Drive URL');
    }
    const fileId = fileIdMatch[1];

    // Download video through our API endpoint
    const response = await fetch(`/api/download-video?fileId=${fileId}`);
    if (!response.ok) {
      throw new Error('Failed to download video');
    }
    const arrayBuffer = await response.arrayBuffer();

    // Create audio context
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Get audio data
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;

    // Analyze energy over time
    const energyData = calculateEnergyOverTime(
      channelData,
      sampleRate,
      opts.windowSize,
      opts.hopSize
    );

    // Detect moments
    const moments = detectMoments(energyData, sampleRate, opts);

    // Calculate statistics
    const averageEnergy = energyData.reduce((a, b) => a + b, 0) / energyData.length;
    const peakEnergy = Math.max(...energyData);

    // Crear blob URL del video para preview de audio
    const blob = new Blob([arrayBuffer], { type: 'video/mp4' });
    const audioUrl = URL.createObjectURL(blob);

    return {
      moments,
      averageEnergy,
      peakEnergy,
      duration,
      audioUrl,
    };
  } catch (error) {
    console.error('Audio analysis failed:', error);
    throw new Error('Failed to analyze audio');
  }
}

/**
 * Calculate energy (RMS) over time using sliding window
 */
function calculateEnergyOverTime(
  channelData: Float32Array,
  sampleRate: number,
  windowSize: number,
  hopSize: number
): number[] {
  const energyData: number[] = [];
  const numWindows = Math.floor((channelData.length - windowSize) / hopSize);

  for (let i = 0; i < numWindows; i++) {
    const start = i * hopSize;
    const end = start + windowSize;
    const window = channelData.slice(start, end);

    // Calculate RMS (Root Mean Square) energy
    const sumSquares = window.reduce((sum, sample) => sum + sample * sample, 0);
    const rms = Math.sqrt(sumSquares / window.length);

    energyData.push(rms);
  }

  return energyData;
}

/**
 * Detect interesting moments based on energy patterns
 */
function detectMoments(
  energyData: number[],
  sampleRate: number,
  options: Required<AnalysisOptions>
): AudioMoment[] {
  const moments: AudioMoment[] = [];
  const hopSize = options.hopSize;

  // Normalize energy data
  const maxEnergy = Math.max(...energyData);
  const normalizedEnergy = energyData.map(e => e / maxEnergy);

  // Detect peaks
  for (let i = 1; i < normalizedEnergy.length - 1; i++) {
    const current = normalizedEnergy[i];
    const prev = normalizedEnergy[i - 1];
    const next = normalizedEnergy[i + 1];

    // Peak detection (local maximum above threshold)
    if (current > options.peakThreshold && current > prev && current > next) {
      const timestamp = (i * hopSize) / sampleRate;
      moments.push({
        timestamp,
        type: 'peak',
        energy: current,
        confidence: Math.min(current / options.peakThreshold, 1),
      });
    }

    // Silence detection
    if (current < options.silenceThreshold) {
      // Find duration of silence
      let duration = 0;
      let j = i;
      while (j < normalizedEnergy.length && normalizedEnergy[j] < options.silenceThreshold) {
        duration++;
        j++;
      }

      if (duration > 5) {
        // At least 5 windows of silence
        const timestamp = (i * hopSize) / sampleRate;
        const silenceDuration = (duration * hopSize) / sampleRate;
        moments.push({
          timestamp,
          type: 'silence',
          energy: current,
          confidence: 1 - current / options.silenceThreshold,
          duration: silenceDuration,
        });
        i = j; // Skip ahead
      }
    }

    // Transition detection (sudden energy change)
    if (i > 0) {
      const energyChange = Math.abs(current - prev);
      if (energyChange > options.transitionThreshold) {
        const timestamp = (i * hopSize) / sampleRate;
        moments.push({
          timestamp,
          type: 'transition',
          energy: current,
          confidence: Math.min(energyChange / options.transitionThreshold, 1),
        });
      }
    }
  }

  // Ordenar por confianza (mejores primero) para seleccionar los más relevantes
  const sortedByConfidence = moments.sort((a, b) => b.confidence - a.confidence);

  // Distancia mínima entre momentos: 15 segundos
  // Esto evita que los clips se superpongan (un clip típico dura 15-60s)
  const MIN_DISTANCE_SECONDS = 15;

  const selectedMoments: AudioMoment[] = [];

  for (const moment of sortedByConfidence) {
    // Verificar que no esté muy cerca de un momento ya seleccionado
    const tooClose = selectedMoments.some(
      m => Math.abs(m.timestamp - moment.timestamp) < MIN_DISTANCE_SECONDS
    );

    if (!tooClose) {
      selectedMoments.push(moment);
    }
  }

  // Ordenar por timestamp para mostrar cronológicamente
  return selectedMoments.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Format timestamp as MM:SS
 */
export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get moment description based on type
 */
export function getMomentDescription(moment: AudioMoment): string {
  switch (moment.type) {
    case 'peak':
      return 'Momento intenso (aplauso, grito, drop)';
    case 'silence':
      return `Silencio dramático (${moment.duration?.toFixed(1)}s)`;
    case 'transition':
      return 'Transición de energía';
    default:
      return 'Momento detectado';
  }
}
