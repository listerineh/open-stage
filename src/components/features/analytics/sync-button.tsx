'use client';

import { RefreshCw } from 'lucide-react';

interface SyncButtonProps {
  onSync: () => Promise<void>;
  syncing: boolean;
  lastSyncedAt: Date | null;
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'hace unos segundos';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function SyncButton({ onSync, syncing, lastSyncedAt }: SyncButtonProps) {
  return (
    <div className="flex items-center gap-3">
      {lastSyncedAt && (
        <span className="text-xs text-zinc-500">
          Actualizado {formatRelativeTime(lastSyncedAt)}
        </span>
      )}
      <button
        onClick={onSync}
        disabled={syncing}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Sincronizando...' : 'Sincronizar'}
      </button>
    </div>
  );
}
