'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const ResultsView = dynamic(
  () => import('@/components/features/results').then(mod => mod.ResultsView),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    ),
  }
);

export default function ResultsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <ResultsView />
    </div>
  );
}
