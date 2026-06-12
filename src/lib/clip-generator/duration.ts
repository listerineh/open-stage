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
  const formatIdeal = format.idealDuration;
  const maxAllowed = format.maxDuration;

  // Duración mínima: al menos 50% del ideal del formato, mínimo 10 segundos
  const minDuration = Math.max(10, Math.round(formatIdeal * 0.5));

  // Calcular duración base: promedio ponderado entre formato y tipo de momento
  // El formato tiene más peso (70%) porque define la plataforma objetivo
  let idealDuration = Math.round(formatIdeal * 0.7 + momentConfig.ideal * 0.3);

  // Ajustar según confianza del momento
  if (moment.confidence > 0.8) {
    idealDuration = Math.min(idealDuration * 1.15, maxAllowed);
  } else if (moment.confidence < 0.5) {
    idealDuration = Math.max(idealDuration * 0.85, minDuration);
  }

  // Ajustar según energía
  if (moment.energy > 0.8) {
    idealDuration = Math.min(idealDuration * 1.1, maxAllowed);
  }

  // Asegurar que esté dentro de los límites
  idealDuration = Math.round(idealDuration);
  idealDuration = Math.min(idealDuration, maxAllowed);
  idealDuration = Math.max(idealDuration, minDuration);

  const halfDuration = idealDuration / 2;
  let startTime = moment.timestamp - halfDuration;
  let endTime = moment.timestamp + halfDuration;

  // Ajustar si el clip empieza antes del video
  if (startTime < 0) {
    startTime = 0;
    endTime = Math.min(idealDuration, videoDuration);
  }

  // Ajustar si el clip termina después del video
  if (endTime > videoDuration) {
    endTime = videoDuration;
    startTime = Math.max(0, videoDuration - idealDuration);
  }

  // Verificar si hay suficiente espacio para el clip mínimo
  const availableDuration = endTime - startTime;
  if (availableDuration < minDuration) {
    // No hay suficiente espacio - extender hacia atrás si es posible
    const needed = minDuration - availableDuration;
    if (startTime >= needed) {
      startTime -= needed;
    } else {
      // Usar todo el espacio disponible desde el inicio
      startTime = 0;
      endTime = Math.min(minDuration, videoDuration);
    }
  }

  // Buscar momentos cercanos para posible extensión
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

  // Calcular duración final con mínimo garantizado
  const finalStartTime = Math.max(0, Math.round(startTime * 100) / 100);
  const finalEndTime = Math.min(videoDuration, Math.round(endTime * 100) / 100);
  const finalDuration = Math.max(minDuration, Math.round(finalEndTime - finalStartTime));

  return {
    startTime: finalStartTime,
    endTime: Math.max(finalStartTime + minDuration, finalEndTime),
    duration: finalDuration,
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
