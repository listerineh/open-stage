'use client';

import { useState } from 'react';
import { Link2, ExternalLink, ArrowRight, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoUrlInputProps {
  onUrlSubmit: (url: string) => void;
  disabled?: boolean;
}

export function VideoUrlInput({ onUrlSubmit, disabled = false }: VideoUrlInputProps) {
  const [url, setUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const validateGoogleDriveUrl = (inputUrl: string): string | null => {
    const patterns = [
      /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = inputUrl.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  };

  const getDirectUrl = (fileId: string): string => {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  };

  const handleSubmit = async () => {
    setError(null);
    setIsValidating(true);

    try {
      const fileId = validateGoogleDriveUrl(url);

      if (!fileId) {
        setError('URL no válida. Usa un enlace de Google Drive.');
        return;
      }

      const directUrl = getDirectUrl(fileId);
      onUrlSubmit(directUrl);
    } catch {
      setError('Error al validar la URL.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && url && !disabled && !isValidating) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-3">
        <label htmlFor="video-url" className="block text-sm font-medium text-zinc-400">
          URL de Google Drive
        </label>
        <div className="relative">
          <div className="relative">
            <Link2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="video-url"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="https://drive.google.com/file/d/..."
              disabled={disabled || isValidating}
              className={cn(
                'w-full rounded-lg border bg-zinc-900 py-3.5 pl-11 pr-4 text-white placeholder-zinc-600',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/20',
                error ? 'border-red-500/50' : 'border-zinc-800 focus:border-violet-500/50'
              )}
            />
            <div
              className={cn(
                'absolute inset-0 -z-10 rounded-lg bg-violet-500/5 blur-xl transition-opacity duration-300',
                isFocused ? 'opacity-100' : 'opacity-0'
              )}
            />
          </div>

          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!url || disabled || isValidating}
          className="w-full h-12 bg-violet-600 hover:bg-violet-500 transition-all duration-200"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Tutorial toggle */}
      <button
        type="button"
        onClick={() => setShowTutorial(!showTutorial)}
        className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-left transition-colors hover:border-zinc-700"
      >
        <span className="text-sm text-zinc-400">¿Cómo subo mi video a Google Drive?</span>
        {showTutorial ? (
          <ChevronUp className="h-4 w-4 text-zinc-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        )}
      </button>

      {/* Tutorial */}
      {showTutorial && (
        <div className="animate-in fade-in slide-in-from-top-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <ol className="space-y-4">
            {[
              {
                text: 'Ve a',
                link: { href: 'https://drive.google.com', label: 'Google Drive' },
              },
              { text: 'Haz clic en "Nuevo" → "Subir archivo"' },
              { text: 'Clic derecho en el archivo → "Compartir"' },
              { text: 'Cambia a "Cualquier persona con el enlace"' },
              { text: 'Copia el enlace y pégalo arriba' },
            ].map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400">
                  {i + 1}
                </span>
                <p className="text-sm text-zinc-400">
                  {step.text}
                  {step.link && (
                    <>
                      {' '}
                      <a
                        href={step.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-400 transition-colors hover:text-violet-300"
                      >
                        {step.link.label}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </>
                  )}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex items-center gap-4 border-t border-zinc-800/50 pt-4 text-xs text-zinc-500">
            <span>MP4, MOV, WebM, AVI, MKV</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>Sin límite de tamaño</span>
          </div>
        </div>
      )}
    </div>
  );
}
