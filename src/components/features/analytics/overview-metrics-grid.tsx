'use client';

import { TrendingUp, TrendingDown, Minus, Users, Music } from 'lucide-react';
import type { SocialPlatform, SocialStatsSnapshot } from '@/types/database';
import { PLATFORM_CONFIGS } from '@/lib/social/types';
import { PlatformIcon } from './platform-icon';

interface OverviewMetricsGridProps {
  latestByPlatform: Partial<Record<SocialPlatform, SocialStatsSnapshot>>;
  getFollowerGrowth: (platform: SocialPlatform) => { absolute: number; percent: number } | null;
  getTotalFollowers: () => number;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function OverviewMetricsGrid({
  latestByPlatform,
  getFollowerGrowth,
  getTotalFollowers,
}: OverviewMetricsGridProps) {
  const connectedPlatforms = Object.keys(latestByPlatform) as SocialPlatform[];
  const total = getTotalFollowers();

  if (connectedPlatforms.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Total followers summary */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
            <Users className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-white">{formatNumber(total)}</p>
            <p className="text-xs text-zinc-500">Total de seguidores combinados</p>
          </div>
        </div>
      </div>

      {/* Per-platform metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {connectedPlatforms.map(platform => {
          const snap = latestByPlatform[platform]!;
          const growth = getFollowerGrowth(platform);
          const config = PLATFORM_CONFIGS[platform];

          return (
            <div
              key={platform}
              className={`rounded-xl border p-5 ${config.borderColor} bg-zinc-900/40`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgColor}`}
                  >
                    <PlatformIcon platform={platform} className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <span className={`text-xs font-medium ${config.color}`}>{config.name}</span>
                </div>

                {growth && (
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      growth.percent > 0
                        ? 'text-emerald-400'
                        : growth.percent < 0
                          ? 'text-red-400'
                          : 'text-zinc-500'
                    }`}
                  >
                    {growth.percent > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : growth.percent < 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                    {Math.abs(growth.percent).toFixed(1)}%
                  </div>
                )}
              </div>

              <div className="mt-3">
                {platform === 'spotify' && snap.metrics.spotify?.needsArtistUrl ? (
                  <div className="flex items-center gap-1.5 text-xs text-amber-400">
                    <Music className="h-3.5 w-3.5 shrink-0" />
                    <span>Configura tu perfil de artista para ver datos reales</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-semibold text-white">
                      {formatNumber(snap.followers)}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">seguidores</p>
                  </>
                )}
              </div>

              {growth && (
                <p className="mt-2 text-xs text-zinc-600">
                  {growth.absolute >= 0 ? '+' : ''}
                  {formatNumber(growth.absolute)} en los últimos 7 días
                </p>
              )}

              <PlatformSpecificMetrics platform={platform} snapshot={snap} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlatformSpecificMetrics({
  platform,
  snapshot,
}: {
  platform: SocialPlatform;
  snapshot: SocialStatsSnapshot;
}) {
  const m = snapshot.metrics;

  if (platform === 'spotify' && m.spotify) {
    if (m.spotify.needsArtistUrl) return null;
    return (
      <div className="mt-3 border-t border-zinc-800/60 pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Popularidad</span>
          <span className="font-medium text-white">{m.spotify.popularity}/100</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${m.spotify.popularity}%` }}
          />
        </div>
      </div>
    );
  }

  if (platform === 'youtube' && m.youtube) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-zinc-800/60 pt-3">
        <div className="text-xs">
          <p className="text-zinc-500">Vistas totales</p>
          <p className="font-medium text-white">{formatNumber(m.youtube.totalViews)}</p>
        </div>
        <div className="text-xs">
          <p className="text-zinc-500">Videos</p>
          <p className="font-medium text-white">{m.youtube.videoCount.toLocaleString()}</p>
        </div>
      </div>
    );
  }

  if (platform === 'instagram' && m.instagram) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-zinc-800/60 pt-3">
        <div className="text-xs">
          <p className="text-zinc-500">Siguiendo</p>
          <p className="font-medium text-white">{formatNumber(m.instagram.following)}</p>
        </div>
        <div className="text-xs">
          <p className="text-zinc-500">Posts</p>
          <p className="font-medium text-white">{m.instagram.mediaCount.toLocaleString()}</p>
        </div>
      </div>
    );
  }

  if (platform === 'tiktok' && m.tiktok) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-zinc-800/60 pt-3">
        <div className="text-xs">
          <p className="text-zinc-500">Me gusta</p>
          <p className="font-medium text-white">{formatNumber(m.tiktok.totalLikes)}</p>
        </div>
        <div className="text-xs">
          <p className="text-zinc-500">Videos</p>
          <p className="font-medium text-white">{m.tiktok.videoCount.toLocaleString()}</p>
        </div>
      </div>
    );
  }

  return null;
}
