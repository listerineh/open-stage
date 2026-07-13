'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Link2, Unlink, Music, Check } from 'lucide-react';
import type { SocialPlatform, SocialConnection } from '@/types/database';
import type { PlatformConfig } from '@/lib/social/types';
import { PlatformIcon } from './platform-icon';

interface PlatformConnectionCardProps {
  config: PlatformConfig;
  connection: SocialConnection | undefined;
  bandId: string;
  isAdmin: boolean;
  onDisconnect: (platform: SocialPlatform) => Promise<void>;
  onConnectionUpdated?: () => void;
}

function extractSpotifyArtistId(input: string): string | null {
  const match = input.match(/spotify\.com\/(?:intl-[a-z]+\/)?artist\/([A-Za-z0-9]+)/);
  if (match) return match[1];
  if (/^[A-Za-z0-9]{22}$/.test(input.trim())) return input.trim();
  return null;
}

export function PlatformConnectionCard({
  config,
  connection,
  bandId,
  isAdmin,
  onDisconnect,
  onConnectionUpdated,
}: PlatformConnectionCardProps) {
  const [disconnecting, setDisconnecting] = useState(false);
  const [artistUrl, setArtistUrl] = useState('');
  const [savingArtist, setSavingArtist] = useState(false);
  const [artistSaved, setArtistSaved] = useState(false);
  const [artistError, setArtistError] = useState<string | null>(null);

  const isConnected = !!connection;
  const profileData = connection?.profile_data as
    | { name?: string; avatar?: string; artistId?: string }
    | undefined;
  const hasArtistId = !!profileData?.artistId;

  const handleConnect = () => {
    window.location.href = `/api/social/connect/${config.id}?bandId=${bandId}`;
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await onDisconnect(config.id);
    } catch (err) {
      console.error('Disconnect error:', err);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSaveArtist = async () => {
    setArtistError(null);
    const artistId = extractSpotifyArtistId(artistUrl);
    if (!artistId) {
      setArtistError(
        'URL inválida. Usa el enlace de compartir de tu perfil de artista en Spotify.'
      );
      return;
    }
    setSavingArtist(true);
    try {
      const res = await fetch('/api/social/spotify-artist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bandId, artistId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setArtistError(data.error ?? 'Error al guardar el artista.');
      } else {
        setArtistSaved(true);
        setArtistUrl('');
        onConnectionUpdated?.();
        setTimeout(() => setArtistSaved(false), 3000);
      }
    } catch {
      setArtistError('Error de red. Intenta de nuevo.');
    } finally {
      setSavingArtist(false);
    }
  };

  return (
    <div
      className={`rounded-xl border p-5 transition-colors ${
        isConnected
          ? `${config.borderColor} bg-zinc-900/60`
          : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}
          >
            <PlatformIcon platform={config.id} className={`h-5 w-5 ${config.color}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{config.name}</span>
              {config.isBeta && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                  Beta
                </span>
              )}
            </div>
            {isConnected && profileData?.name ? (
              <p className="mt-0.5 truncate text-xs text-zinc-400">@{profileData.name}</p>
            ) : (
              <p className="mt-0.5 text-xs text-zinc-500">
                {isConnected ? 'Conectado' : 'No conectado'}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isConnected ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-zinc-700" />
          )}
        </div>
      </div>

      {config.isBeta && !isConnected && (
        <p className="mt-3 text-xs text-zinc-500">{config.betaNote}</p>
      )}

      {isAdmin && (
        <div className="mt-4 space-y-3">
          {isConnected ? (
            <>
              {/* Spotify: artist URL input */}
              {config.id === 'spotify' && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <Music className="h-3 w-3" />
                    Perfil de artista
                    {hasArtistId && (
                      <span className="ml-auto flex items-center gap-1 text-emerald-400">
                        <Check className="h-3 w-3" /> Configurado
                      </span>
                    )}
                  </div>
                  {!hasArtistId && (
                    <p className="mt-1 text-xs text-zinc-600">
                      Agrega tu URL de artista para ver métricas reales de tu banda.
                    </p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={artistUrl}
                      onChange={e => setArtistUrl(e.target.value)}
                      placeholder="https://open.spotify.com/artist/..."
                      className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleSaveArtist}
                      disabled={savingArtist || !artistUrl.trim()}
                      className="shrink-0 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
                    >
                      {savingArtist ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : artistSaved ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        'Guardar'
                      )}
                    </button>
                  </div>
                  {artistError && <p className="mt-1.5 text-xs text-red-400">{artistError}</p>}
                </div>
              )}
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-red-400 disabled:opacity-50"
              >
                {disconnecting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Unlink className="h-3 w-3" />
                )}
                Desconectar
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${config.borderColor} ${config.color} bg-transparent ${config.hoverBgColor}`}
            >
              <Link2 className="h-3.5 w-3.5" />
              Conectar {config.name}
            </button>
          )}
        </div>
      )}

      {!isAdmin && !isConnected && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-600">
          <AlertCircle className="h-3 w-3" />
          Solo los admins pueden conectar plataformas
        </div>
      )}
    </div>
  );
}
