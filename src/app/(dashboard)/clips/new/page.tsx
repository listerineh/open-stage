'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FormatSelector } from '@/components/features/clip-settings';
import { PageContainer } from '@/components/ui/page-container';
import { PageHeader } from '@/components/ui/page-header';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Film, Loader2 } from 'lucide-react';
import Link from 'next/link';

function NewClipContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get('video');

  const [selectedFormats, setSelectedFormats] = useState<string[]>(['tiktok', 'reels', 'shorts']);

  if (!videoUrl) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-zinc-400">No se ha seleccionado ningún video</p>
          <Link
            href="/upload"
            className="mt-4 text-sm text-violet-400 transition-colors hover:text-violet-300"
          >
            Ir a agregar video
          </Link>
        </div>
      </PageContainer>
    );
  }

  const handleContinue = () => {
    const params = new URLSearchParams({
      video: videoUrl,
      formats: selectedFormats.join(','),
    });
    router.push(`/clips/new/intent?${params.toString()}`);
  };

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="space-y-6">
          <BackLink href="/upload" />
          <PageHeader
            title="Configurar clips"
            description="Selecciona los formatos de salida para tus clips"
          />
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Film className="h-5 w-5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Video seleccionado</p>
              <p className="mt-0.5 text-xs text-zinc-500 truncate">{videoUrl}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-base font-medium text-white">Formatos de salida</h2>
            <FormatSelector
              selectedFormats={selectedFormats}
              onSelectionChange={setSelectedFormats}
              multiple={true}
            />
          </div>

          <div className="flex justify-end pt-6 border-t border-zinc-800/50">
            <Button onClick={handleContinue} disabled={selectedFormats.length === 0} size="lg">
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
    </div>
  );
}

export default function NewClipPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewClipContent />
    </Suspense>
  );
}
