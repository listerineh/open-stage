'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VideoUrlInput } from '@/components/features/video-upload';
import { PageContainer } from '@/components/ui/page-container';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleUrlSubmit = (url: string) => {
    setVideoUrl(url);
  };

  const handleContinue = () => {
    if (videoUrl) {
      router.push(`/clips/new?video=${encodeURIComponent(videoUrl)}`);
    }
  };

  const handleReset = () => {
    setVideoUrl(null);
  };

  return (
    <PageContainer size="sm">
      <div className="space-y-8">
        <PageHeader
          title="Agregar video"
          description="Comparte un video desde Google Drive para generar clips"
        />

        {!videoUrl ? (
          <VideoUrlInput onUrlSubmit={handleUrlSubmit} />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white">Video listo</p>
                <p className="mt-1 text-sm text-zinc-500 truncate">{videoUrl}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-zinc-800/50 pt-6">
              <button
                onClick={handleReset}
                className="text-sm text-zinc-500 transition-colors hover:text-white"
              >
                Cambiar video
              </button>
              <Button onClick={handleContinue}>
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
