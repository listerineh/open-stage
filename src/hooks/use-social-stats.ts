'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SocialPlatform, SocialStatsSnapshot } from '@/types/database';

const AUTO_SYNC_THRESHOLD_HOURS = 6;

interface SocialStatsState {
  snapshots: SocialStatsSnapshot[];
  latestByPlatform: Partial<Record<SocialPlatform, SocialStatsSnapshot>>;
  loading: boolean;
  syncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
}

export function useSocialStats(bandId: string | null) {
  const [state, setState] = useState<SocialStatsState>({
    snapshots: [],
    latestByPlatform: {},
    loading: true,
    syncing: false,
    lastSyncedAt: null,
    error: null,
  });

  const supabase = createClient();
  const hasMountedSync = useRef(false);

  const fetchSnapshots = useCallback(async () => {
    if (!bandId) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('social_stats_snapshots')
        .select('*')
        .eq('band_id', bandId)
        .gte('snapshot_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('snapshot_date', { ascending: true });

      if (error) throw error;

      const snapshots = (data as SocialStatsSnapshot[]) ?? [];

      const latestByPlatform: Partial<Record<SocialPlatform, SocialStatsSnapshot>> = {};
      for (const snap of snapshots) {
        const existing = latestByPlatform[snap.platform];
        if (!existing || snap.snapshot_date > existing.snapshot_date) {
          latestByPlatform[snap.platform] = snap;
        }
      }

      const allSyncDates = snapshots
        .map(s => new Date(s.synced_at))
        .sort((a, b) => b.getTime() - a.getTime());
      const lastSyncedAt = allSyncDates[0] ?? null;

      setState(prev => ({
        ...prev,
        snapshots,
        latestByPlatform,
        lastSyncedAt,
        loading: false,
        error: null,
      }));

      return lastSyncedAt;
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Error loading stats',
      }));
      return null;
    }
  }, [bandId, supabase]);

  const sync = useCallback(
    async (platform?: SocialPlatform): Promise<void> => {
      if (!bandId) return;

      setState(prev => ({ ...prev, syncing: true, error: null }));

      try {
        const res = await fetch('/api/social/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bandId, platform }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? 'Sync failed');
        }

        await fetchSnapshots();
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Sync failed',
        }));
      } finally {
        setState(prev => ({ ...prev, syncing: false }));
      }
    },
    [bandId, fetchSnapshots]
  );

  useEffect(() => {
    if (!bandId || hasMountedSync.current) return;
    hasMountedSync.current = true;

    fetchSnapshots().then(lastSync => {
      if (!lastSync) return;
      const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
      if (hoursSinceSync >= AUTO_SYNC_THRESHOLD_HOURS) {
        sync();
      }
    });
  }, [bandId, fetchSnapshots, sync]);

  const getSnapshotsForPlatform = useCallback(
    (platform: SocialPlatform): SocialStatsSnapshot[] =>
      state.snapshots.filter(s => s.platform === platform),
    [state.snapshots]
  );

  const getTotalFollowers = useCallback((): number => {
    return Object.values(state.latestByPlatform).reduce(
      (sum, snap) => sum + (snap?.followers ?? 0),
      0
    );
  }, [state.latestByPlatform]);

  const getFollowerGrowth = useCallback(
    (platform: SocialPlatform): { absolute: number; percent: number } | null => {
      const platformSnaps = getSnapshotsForPlatform(platform);
      if (platformSnaps.length < 2) return null;

      const latest = platformSnaps[platformSnaps.length - 1];
      const weekAgo = platformSnaps.find(s => {
        const diff = new Date(latest.snapshot_date).getTime() - new Date(s.snapshot_date).getTime();
        return diff >= 6 * 24 * 60 * 60 * 1000;
      });

      if (!weekAgo) return null;

      const absolute = latest.followers - weekAgo.followers;
      const percent = weekAgo.followers > 0 ? (absolute / weekAgo.followers) * 100 : 0;

      return { absolute, percent };
    },
    [getSnapshotsForPlatform]
  );

  return {
    ...state,
    sync,
    refresh: fetchSnapshots,
    getSnapshotsForPlatform,
    getTotalFollowers,
    getFollowerGrowth,
  };
}
