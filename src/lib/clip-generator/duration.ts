import { type AudioMoment } from '@/lib/audio';
import { DURATION_BY_MOMENT_TYPE, type ClipFormat } from './types';

export interface DurationResult {
  startTime: number;
  endTime: number;
  duration: number;
}

export function calculateSmartDuration(
  moment: AudioMoment,
  videoDuration: number,
  format: ClipFormat,
  allMoments: AudioMoment[] = []
): DurationResult {
  const momentConfig = DURATION_BY_MOMENT_TYPE[moment.type];

  // Usar la duración ideal del formato como base, ajustada por el tipo de momento
  // El formato define la duración objetivo (ej: TikTok ~30s, Story 15s, YouTube ~2min)
  const formatIdeal = format.idealDuration;
  const maxAllowed = format.maxDuration;

  // Calcular duración base: promedio ponderado entre formato y tipo de momento
  // El formato tiene más peso (70%) porque define la plataforma objetivo
  let idealDuration = Math.round(formatIdeal * 0.7 + momentConfig.ideal * 0.3);

  // Ajustar según confianza del momento
  if (moment.confidence > 0.8) {
    // Momento muy confiable: puede ser un poco más largo
    idealDuration = Math.min(idealDuration * 1.15, maxAllowed);
  } else if (moment.confidence < 0.5) {
    // Momento menos confiable: mantenerlo más corto
    idealDuration = Math.max(idealDuration * 0.85, momentConfig.min);
  }

  // Ajustar según energía
  if (moment.energy > 0.8) {
    // Alta energía: puede extenderse un poco
    idealDuration = Math.min(idealDuration * 1.1, maxAllowed);
  }

  // Asegurar que esté dentro de los límites
  idealDuration = Math.round(idealDuration);
  idealDuration = Math.min(idealDuration, maxAllowed);
  idealDuration = Math.max(idealDuration, momentConfig.min);

  const halfDuration = idealDuration / 2;
  let startTime = moment.timestamp - halfDuration;
  let endTime = moment.timestamp + halfDuration;

  if (startTime < 0) {
    startTime = 0;
    endTime = Math.min(idealDuration, videoDuration);
  }

  if (endTime > videoDuration) {
    endTime = videoDuration;
    startTime = Math.max(0, videoDuration - idealDuration);
  }

  const nearbyMoments = allMoments.filter(m => {
    if (m === moment) return false;
    const diff = Math.abs(m.timestamp - moment.timestamp);
    return diff < idealDuration && diff > 2;
  });

  if (nearbyMoments.length > 0) {
    const furthestMoment = nearbyMoments.reduce((prev, curr) => {
      const prevDiff = Math.abs(prev.timestamp - moment.timestamp);
      const currDiff = Math.abs(curr.timestamp - moment.timestamp);
      return currDiff > prevDiff ? curr : prev;
    });

    const extendedEnd = Math.min(furthestMoment.timestamp + 3, videoDuration);
    if (extendedEnd - startTime <= maxAllowed) {
      endTime = extendedEnd;
    }
  }

  // Asegurar que la duración sea positiva y válida
  const finalDuration = Math.max(1, Math.round(endTime - startTime));
  const finalStartTime = Math.max(0, Math.round(startTime * 100) / 100);
  const finalEndTime = Math.min(videoDuration, Math.round(endTime * 100) / 100);

  return {
    startTime: finalStartTime,
    endTime: Math.max(finalStartTime + 1, finalEndTime),
    duration: Math.max(1, finalDuration),
  };
}

export function generateClipConfigs(
  moments: AudioMoment[],
  selectedIndices: number[],
  videoDuration: number,
  format: ClipFormat
) {
  return selectedIndices.map(index => {
    const moment = moments[index];
    const { startTime, endTime, duration } = calculateSmartDuration(
      moment,
      videoDuration,
      format,
      moments
    );

    return {
      moment,
      momentIndex: index,
      startTime,
      endTime,
      duration,
      format,
    };
  });
}
