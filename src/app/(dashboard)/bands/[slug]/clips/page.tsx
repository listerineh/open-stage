'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Video, Clock, Calendar, Play, ExternalLink, Loader2 } from 'lucide-react';
import type { Clip } from '@/types/database';

interface ClipWithProfile extends Clip {
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const FORMAT_LABELS: Record<string, string> = {
  tiktok: 'TikTok',
  reels: 'Reels',
  shorts: 'Shorts',
  instagram: 'Instagram',
  youtube: 'YouTube',
};

export default function BandClipsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [clips, setClips] = useState<ClipWithProfile[]>([]);
  const [bandName, setBandName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedClip, setSelectedClip] = useState<ClipWithProfile | null>(null);

  useEffect(() => {
    async function fetchClips() {
      const supabase = createClient();

      // Get band info
      const { data: band } = await supabase
        .from('bands')
        .select('id, name')
        .eq('slug', slug)
        .single();

      if (!band) {
        setLoading(false);
        return;
      }

      setBandName(band.name);

      // Get clips for this band
      const { data: clipsData } = await supabase
        .from('clips')
        .select(
          `
          *,
          profiles:created_by (
            full_name,
            avatar_url
          )
        `
        )
        .eq('band_id', band.id)
        .order('created_at', { ascending: false });

      setClips(clipsData || []);
      setLoading(false);
    }

    fetchClips();
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/bands/${slug}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a {bandName}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Clips guardados</h1>
        <p className="mt-1 text-zinc-500">
          {clips.length} clip{clips.length !== 1 ? 's' : ''} en Google Drive
        </p>
      </div>

      {clips.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
            <Video className="h-8 w-8 text-zinc-500" />
          </div>
          <h2 className="mt-4 text-lg font-medium text-white">No hay clips guardados</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Los clips que guardes en Drive aparecerán aquí
          </p>
          <Link
            href="/tools/clip-generator"
            className="mt-6 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            Crear clips
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Clips grid */}
          <div className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              {clips.map(clip => (
                <button
                  key={clip.id}
                  onClick={() => setSelectedClip(clip)}
                  className={`group rounded-xl border p-4 text-left transition-all ${
                    selectedClip?.id === clip.id
                      ? 'border-violet-500/50 bg-violet-500/5'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-violet-500/10 group-hover:text-violet-400">
                      <Play className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white">{clip.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5">
                          {FORMAT_LABELS[clip.format] || clip.format}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(clip.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(clip.created_at)}
                    </span>
                    <span>{clip.aspect_ratio}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              {selectedClip ? (
                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80">
                  {/* Video preview iframe */}
                  <div className="aspect-video bg-black">
                    <iframe
                      src={`https://drive.google.com/file/d/${selectedClip.drive_file_id}/preview`}
                      width="100%"
                      height="100%"
                      allow="autoplay"
                      allowFullScreen
                      className="border-0"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium text-white">{selectedClip.name}</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {FORMAT_LABELS[selectedClip.format] || selectedClip.format} •{' '}
                      {formatDuration(selectedClip.duration)}
                    </p>

                    {selectedClip.description && (
                      <p className="mt-3 text-sm text-zinc-400">{selectedClip.description}</p>
                    )}

                    <a
                      href={selectedClip.drive_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir en Drive
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30">
                  <Video className="h-8 w-8 text-zinc-600" />
                  <p className="mt-2 text-sm text-zinc-500">Selecciona un clip para ver</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
