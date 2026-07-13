'use client';

import { ExternalLink, Music, Play } from 'lucide-react';
import type {
  SocialPlatform,
  SocialStatsSnapshot,
  SpotifyTrack,
  YouTubeVideo,
} from '@/types/database';
import { PLATFORM_CONFIGS } from '@/lib/social/types';
import { PlatformIcon } from './platform-icon';

interface PlatformBreakdownProps {
  latestByPlatform: Partial<Record<SocialPlatform, SocialStatsSnapshot>>;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function PlatformBreakdown({ latestByPlatform }: PlatformBreakdownProps) {
  const platforms = Object.keys(latestByPlatform) as SocialPlatform[];
  if (platforms.length === 0) return null;

  return (
    <div className="space-y-4">
      {platforms.map(platform => {
        const snap = latestByPlatform[platform]!;
        const config = PLATFORM_CONFIGS[platform];

        return (
          <div key={platform} className="rounded-xl border border-zinc-800 bg-zinc-900/40">
            <div className={`flex items-center gap-2.5 border-b border-zinc-800 px-5 py-3`}>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${config.bgColor}`}
              >
                <PlatformIcon platform={platform} className={`h-3.5 w-3.5 ${config.color}`} />
              </div>
              <span className="text-sm font-medium text-white">{config.name}</span>
            </div>

            <div className="p-5">
              {platform === 'spotify' &&
                (snap.metrics.spotify?.needsArtistUrl ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <Music className="h-7 w-7 text-zinc-700" />
                    <p className="text-xs font-medium text-zinc-400">
                      Perfil de artista no configurado
                    </p>
                    <p className="max-w-xs text-xs text-zinc-600">
                      Ve a la sección <span className="text-zinc-400">Plataformas</span> y agrega la
                      URL de tu perfil de artista en Spotify para ver métricas reales.
                    </p>
                  </div>
                ) : snap.metrics.spotify?.topTracks && snap.metrics.spotify.topTracks.length > 0 ? (
                  <SpotifyTopTracks
                    tracks={snap.metrics.spotify.topTracks}
                    popularity={snap.metrics.spotify.popularity}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4 text-center">
                    <p className="text-xs text-zinc-500">No hay canciones disponibles aún.</p>
                    <p className="text-xs text-zinc-600">
                      Sincroniza de nuevo para cargar tus top tracks.
                    </p>
                  </div>
                ))}

              {platform === 'youtube' &&
                snap.metrics.youtube?.recentVideos &&
                snap.metrics.youtube.recentVideos.length > 0 && (
                  <YouTubeRecentVideos videos={snap.metrics.youtube.recentVideos} />
                )}

              {platform === 'instagram' && snap.metrics.instagram && (
                <InstagramInsights
                  reach={snap.metrics.instagram.reach}
                  impressions={snap.metrics.instagram.impressions}
                />
              )}

              {platform === 'tiktok' && snap.metrics.tiktok && (
                <TikTokStats
                  totalLikes={snap.metrics.tiktok.totalLikes}
                  videoCount={snap.metrics.tiktok.videoCount}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SpotifyTopTracks({ tracks, popularity }: { tracks: SpotifyTrack[]; popularity: number }) {
  return (
    <div>
      {popularity > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Popularidad del artista</span>
            <span className="font-medium text-white">{popularity}/100</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${popularity}%` }}
            />
          </div>
        </div>
      )}
      <p className="mb-3 text-xs font-medium text-zinc-500">Top Canciones</p>
      <div className="space-y-2">
        {tracks.map((track, i) => (
          <div key={track.id} className="flex items-center gap-3">
            <span className="w-4 shrink-0 text-center text-xs text-zinc-600">{i + 1}</span>
            {track.albumImageUrl ? (
              <img
                src={track.albumImageUrl}
                alt={track.albumName}
                className="h-8 w-8 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-zinc-800">
                <Music className="h-3.5 w-3.5 text-zinc-600" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{track.name}</p>
              <p className="truncate text-xs text-zinc-500">{track.albumName}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="h-1 w-12 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${track.popularity}%` }}
                />
              </div>
              <a
                href={track.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 transition-colors hover:text-zinc-400"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function YouTubeRecentVideos({ videos }: { videos: YouTubeVideo[] }) {
  return (
    <div>
      <p className="mb-3 text-xs font-medium text-zinc-500">Videos Recientes</p>
      <div className="space-y-3">
        {videos.map(video => (
          <a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 rounded-lg transition-colors hover:bg-zinc-800/30"
          >
            <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded bg-zinc-800">
              {video.thumbnailUrl && (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-full bg-black/60 p-1">
                  <Play className="h-3 w-3 text-white" fill="white" />
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-xs font-medium text-white group-hover:text-zinc-300">
                {video.title}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                <span>{formatNumber(video.viewCount)} vistas</span>
                <span>·</span>
                <span>{formatNumber(video.likeCount)} likes</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function InstagramInsights({ reach, impressions }: { reach?: number; impressions?: number }) {
  if (!reach && !impressions) {
    return (
      <p className="text-xs text-zinc-500">
        Las métricas de alcance requieren una cuenta de Instagram Business o Creator.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {reach !== undefined && (
        <div>
          <p className="text-xs text-zinc-500">Alcance (ayer)</p>
          <p className="mt-1 text-lg font-semibold text-white">{formatNumber(reach)}</p>
        </div>
      )}
      {impressions !== undefined && (
        <div>
          <p className="text-xs text-zinc-500">Impresiones (ayer)</p>
          <p className="mt-1 text-lg font-semibold text-white">{formatNumber(impressions)}</p>
        </div>
      )}
    </div>
  );
}

function TikTokStats({ totalLikes, videoCount }: { totalLikes: number; videoCount: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-xs text-zinc-500">Total de Me Gusta</p>
        <p className="mt-1 text-lg font-semibold text-white">{formatNumber(totalLikes)}</p>
      </div>
      <div>
        <p className="text-xs text-zinc-500">Videos publicados</p>
        <p className="mt-1 text-lg font-semibold text-white">{videoCount.toLocaleString()}</p>
      </div>
    </div>
  );
}
