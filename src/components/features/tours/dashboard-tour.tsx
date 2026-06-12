'use client';

import { useEffect } from 'react';
import { useTour } from '@/lib/tour';
import { DASHBOARD_TOUR } from '@/lib/tour/tours';

export function DashboardTour() {
  const { startTour, isLoading, isCompleted } = useTour({
    tourId: 'dashboard',
    steps: DASHBOARD_TOUR,
  });

  useEffect(() => {
    if (!isLoading && !isCompleted) {
      startTour();
    }
  }, [isLoading, isCompleted, startTour]);

  return null;
}
