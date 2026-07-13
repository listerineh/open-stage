'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart2, Wifi, WifiOff } from 'lucide-react';
import { useBand } from '@/hooks/use-band';
import { useSocialConnections } from '@/hooks/use-social-connections';
import { useSocialStats } from '@/hooks/use-social-stats';
import { PLATFORM_CONFIGS } from '@/lib/social/types';
import type { SocialPlatform } from '@/types/database';
import { PlatformConnectionCard } from '@/components/features/analytics/platform-connection-card';
import { OverviewMetricsGrid } from '@/components/features/analytics/overview-metrics-grid';
import { GrowthChart } from '@/components/features/analytics/growth-chart';
import { PlatformBreakdown } from '@/components/features/analytics/platform-breakdown';
import { SyncButton } from '@/components/features/analytics/sync-button';

const PLATFORMS: SocialPlatform[] = ['spotify', 'youtube', 'instagram', 'tiktok'];

export default function AnalyticsDashboardPage() {
  const searchParams = useSearchParams();
  const { currentBand, isAdmin, loading: bandLoading } = useBand();

  const {
    connections,
    loading: connectionsLoading,
    getConnection,
    disconnect,
    refresh: refreshConnections,
  } = useSocialConnections(currentBand?.id ?? null);

  const {
    snapshots,
    latestByPlatform,
    syncing,
    lastSyncedAt,
    loading: statsLoading,
    error: statsError,
    sync,
    getTotalFollowers,
    getFollowerGrowth,
  } = useSocialStats(currentBand?.id ?? null);

  const connectedPlatforms = connections.map(c => c.platform);
  const hasConnectedPlatforms = connectedPlatforms.length > 0;

  useEffect(() => {
    const connected = searchParams.get('connected');
    if (connected) {
      refreshConnections();
    }
  }, [searchParams, refreshConnections]);

  const loading = bandLoading || connectionsLoading;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
      </div>
    );
  }

  if (!currentBand) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 pt-22 sm:px-6 lg:px-12 lg:pt-10">
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <p className="text-sm text-zinc-500">Selecciona o crea una banda para ver el analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pt-22 sm:px-6 lg:px-12 lg:pt-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <BarChart2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Analytics</h1>
              <p className="text-sm text-zinc-500">{currentBand.name}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            Conecta tus redes sociales para ver métricas unificadas, tendencias y crecimiento.
          </p>
        </div>

        {hasConnectedPlatforms && !statsLoading && (
          <div className="shrink-0">
            <SyncButton onSync={() => sync()} syncing={syncing} lastSyncedAt={lastSyncedAt} />
          </div>
        )}
      </div>

      {/* Connection status banner for non-admins */}
      {!isAdmin && !hasConnectedPlatforms && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <WifiOff className="h-4 w-4 shrink-0 text-zinc-500" />
          <p className="text-sm text-zinc-400">
            Ninguna plataforma está conectada todavía. Pídele al admin de tu banda que conecte las
            redes sociales.
          </p>
        </div>
      )}

      {/* Error banner */}
      {statsError && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">{statsError}</p>
        </div>
      )}

      {/* Connected platforms section */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-white">Plataformas</h2>
          {hasConnectedPlatforms && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Wifi className="h-3.5 w-3.5" />
              {connectedPlatforms.length} conectada{connectedPlatforms.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PLATFORMS.map(platform => (
            <PlatformConnectionCard
              key={platform}
              config={PLATFORM_CONFIGS[platform]}
              connection={getConnection(platform)}
              bandId={currentBand.id}
              isAdmin={isAdmin}
              onDisconnect={disconnect}
              onConnectionUpdated={refreshConnections}
            />
          ))}
        </div>
      </section>

      {/* Metrics — only shown when connected and data available */}
      {hasConnectedPlatforms && (
        <>
          {statsLoading ? (
            <div className="mt-8 flex items-center justify-center py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-400" />
            </div>
          ) : Object.keys(latestByPlatform).length === 0 ? (
            <section className="mt-8">
              <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center">
                <BarChart2 className="mx-auto h-8 w-8 text-zinc-700" />
                <p className="mt-3 text-sm text-zinc-500">Aún no hay datos sincronizados</p>
                <p className="mt-1 text-xs text-zinc-600">
                  Haz click en &quot;Sincronizar&quot; para obtener las métricas de tus redes
                  conectadas
                </p>
                <button
                  onClick={() => sync()}
                  disabled={syncing}
                  className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                  {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
                </button>
              </div>
            </section>
          ) : syncing ? (
            <AnalyticsSkeleton />
          ) : (
            <>
              {/* Overview metrics */}
              <section className="mt-8">
                <h2 className="mb-4 text-base font-medium text-white">Resumen</h2>
                <OverviewMetricsGrid
                  latestByPlatform={latestByPlatform}
                  getFollowerGrowth={getFollowerGrowth}
                  getTotalFollowers={getTotalFollowers}
                />
              </section>

              {/* Growth chart */}
              <section className="mt-8">
                <h2 className="mb-4 text-base font-medium text-white">Tendencias</h2>
                <GrowthChart
                  snapshots={snapshots}
                  connectedPlatforms={connectedPlatforms}
                  lastSyncedAt={lastSyncedAt}
                />
              </section>

              {/* Platform breakdown */}
              <section className="mt-8">
                <h2 className="mb-4 text-base font-medium text-white">Detalles por plataforma</h2>
                <PlatformBreakdown latestByPlatform={latestByPlatform} />
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Sk({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-zinc-800 ${className}`} />;
}

function AnalyticsSkeleton() {
  return (
    <div className="mt-8 space-y-8">
      {/* Overview skeleton */}
      <section>
        <Sk className="mb-4 h-5 w-20" />
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3">
              <Sk className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Sk className="h-7 w-24" />
                <Sk className="h-3 w-36" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1].map(i => (
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sk className="h-8 w-8 rounded-lg" />
                    <Sk className="h-3 w-16" />
                  </div>
                  <Sk className="h-3 w-10" />
                </div>
                <div className="mt-3 space-y-1.5">
                  <Sk className="h-7 w-20" />
                  <Sk className="h-3 w-14" />
                </div>
                <div className="mt-3 border-t border-zinc-800/60 pt-3">
                  <Sk className="h-2 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chart skeleton */}
      <section>
        <Sk className="mb-4 h-5 w-24" />
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <Sk className="h-48 w-full rounded-lg" />
        </div>
      </section>

      {/* Breakdown skeleton */}
      <section>
        <Sk className="mb-4 h-5 w-40" />
        <div className="space-y-4">
          {[0, 1].map(i => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center gap-2.5 border-b border-zinc-800 px-5 py-3">
                <Sk className="h-7 w-7 rounded-lg" />
                <Sk className="h-3.5 w-16" />
              </div>
              <div className="space-y-3 p-5">
                {[0, 1, 2].map(j => (
                  <div key={j} className="flex items-center gap-3">
                    <Sk className="h-3 w-3" />
                    <Sk className="h-8 w-8 rounded" />
                    <div className="flex-1 space-y-1.5">
                      <Sk className="h-3 w-32" />
                      <Sk className="h-2.5 w-20" />
                    </div>
                    <Sk className="h-1.5 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
