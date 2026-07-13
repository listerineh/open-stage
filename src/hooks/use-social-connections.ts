'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SocialConnection, SocialPlatform } from '@/types/database';

interface SocialConnectionsState {
  connections: SocialConnection[];
  loading: boolean;
  error: string | null;
}

export function useSocialConnections(bandId: string | null) {
  const [state, setState] = useState<SocialConnectionsState>({
    connections: [],
    loading: true,
    error: null,
  });

  const supabase = createClient();

  const fetchConnections = useCallback(async () => {
    if (!bandId) {
      setState({ connections: [], loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('band_id', bandId)
        .order('connected_at', { ascending: false });

      if (error) throw error;

      setState({
        connections: (data as SocialConnection[]) ?? [],
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Error loading connections',
      }));
    }
  }, [bandId, supabase]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const isConnected = useCallback(
    (platform: SocialPlatform): boolean => state.connections.some(c => c.platform === platform),
    [state.connections]
  );

  const getConnection = useCallback(
    (platform: SocialPlatform): SocialConnection | undefined =>
      state.connections.find(c => c.platform === platform),
    [state.connections]
  );

  const disconnect = useCallback(
    async (platform: SocialPlatform): Promise<void> => {
      if (!bandId) return;

      const res = await fetch('/api/social/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bandId, platform }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to disconnect');
      }

      await fetchConnections();
    },
    [bandId, fetchConnections]
  );

  return {
    ...state,
    isConnected,
    getConnection,
    disconnect,
    refresh: fetchConnections,
  };
}
