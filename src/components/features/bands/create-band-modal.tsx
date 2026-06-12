'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useBand } from '@/hooks/use-band';
import { X, Loader2, Music, ArrowRight, AlertCircle } from 'lucide-react';
import { LogoUpload } from '@/components/ui/logo-upload';
import { GenreSelector, stringifyGenres } from '@/components/ui/genre-selector';

interface CreateBandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBandModal({ isOpen, onClose }: CreateBandModalProps) {
  const router = useRouter();
  const { createBand, generateSlug } = useBand();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bandName, setBandName] = useState('');
  const [bandGenres, setBandGenres] = useState<string[]>([]);
  const [bandDescription, setBandDescription] = useState('');
  const [bandLogoUrl, setBandLogoUrl] = useState<string | null>(null);

  const handleCreateBand = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const slug = generateSlug(bandName);
      const genreString = stringifyGenres(bandGenres) || undefined;
      await createBand(
        bandName,
        slug,
        bandDescription || undefined,
        genreString,
        bandLogoUrl || undefined
      );
      onClose();
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la banda');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setBandName('');
    setBandGenres([]);
    setBandDescription('');
    setBandLogoUrl(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative z-10 mx-4 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Crear nueva banda</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCreateBand}>
            <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-4">
              {/* Logo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-400">Logo de la banda</label>
                <LogoUpload
                  currentLogoUrl={bandLogoUrl}
                  onUpload={url => setBandLogoUrl(url)}
                  onRemove={() => setBandLogoUrl(null)}
                />
              </div>

              {/* Band name */}
              <div className="space-y-2">
                <label htmlFor="bandName" className="block text-sm font-medium text-zinc-400">
                  Nombre de la banda *
                </label>
                <div className="relative">
                  <Music className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600" />
                  <input
                    id="bandName"
                    type="text"
                    value={bandName}
                    onChange={e => setBandName(e.target.value)}
                    required
                    placeholder="Ej: Los Amplificados"
                    className="block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-3 pl-11 pr-4 text-white placeholder-zinc-600 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              {/* Genre */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-400">Géneros musicales</label>
                <GenreSelector value={bandGenres} onChange={setBandGenres} />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label
                  htmlFor="bandDescription"
                  className="block text-sm font-medium text-zinc-400"
                >
                  Descripción
                </label>
                <textarea
                  id="bandDescription"
                  value={bandDescription}
                  onChange={e => setBandDescription(e.target.value)}
                  placeholder="Cuéntanos sobre tu banda..."
                  rows={3}
                  className="block w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-zinc-800 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-zinc-800 bg-transparent hover:bg-zinc-800/50"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-violet-600 hover:bg-violet-500"
                disabled={loading || !bandName.trim()}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Crear banda
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
