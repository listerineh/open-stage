'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const ProcessingView = dynamic(
  () => import('@/components/features/processing').then(mod => mod.ProcessingView),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    ),
  }
);

export default function ProcessingPage() {
  return <ProcessingView />;
}
