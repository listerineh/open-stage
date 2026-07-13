'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Link2, Unlink } from 'lucide-react';
import type { SocialPlatform, SocialConnection } from '@/types/database';
import type { PlatformConfig } from '@/lib/social/types';
import { PlatformIcon } from './platform-icon';

interface PlatformConnectionCardProps {
  config: PlatformConfig;
  connection: SocialConnection | undefined;
  bandId: string;
  isAdmin: boolean;
  onDisconnect: (platform: SocialPlatform) => Promise<void>;
}

export function PlatformConnectionCard({
  config,
  connection,
  bandId,
  isAdmin,
  onDisconnect,
}: PlatformConnectionCardProps) {
  const [disconnecting, setDisconnecting] = useState(false);

  const isConnected = !!connection;
  const profileData = connection?.profile_data as { name?: string; avatar?: string } | undefined;

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
        <div className="mt-4">
          {isConnected ? (
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
