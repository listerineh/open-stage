'use client';

import { useEffect } from 'react';
import { useTour } from '@/lib/tour';
import { CLIP_GENERATOR_TOUR } from '@/lib/tour/tours';

export function ClipGeneratorTour() {
  const { startTour, isLoading, isCompleted } = useTour({
    tourId: 'clip-generator',
    steps: CLIP_GENERATOR_TOUR,
  });

  useEffect(() => {
    if (!isLoading && !isCompleted) {
      startTour();
    }
  }, [isLoading, isCompleted, startTour]);

  return null;
}
