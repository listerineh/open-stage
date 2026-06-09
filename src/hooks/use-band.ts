'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, UserBand, BandRole } from '@/types/database';

interface BandState {
  profile: Profile | null;
  bands: UserBand[];
  currentBand: UserBand | null;
  loading: boolean;
  error: string | null;
}

export function useBand() {
  const [state, setState] = useState<BandState>({
    profile: null,
    bands: [],
    currentBand: null,
    loading: true,
    error: null,
  });

  const supabase = createClient();

  const fetchBandData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch user's bands using the function
      const { data: bands, error: bandsError } = await supabase.rpc('get_user_bands');

      if (bandsError) throw bandsError;

      const currentBand = bands?.find((b: UserBand) => b.is_current) || null;

      setState({
        profile,
        bands: bands || [],
        currentBand,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error loading band data',
      }));
    }
  }, [supabase]);

  useEffect(() => {
    fetchBandData();
  }, [fetchBandData]);

  const createBand = useCallback(
    async (name: string, slug: string, description?: string, genre?: string, logoUrl?: string) => {
      const { data, error } = await supabase.rpc('create_band_with_admin', {
        p_name: name,
        p_slug: slug,
        p_description: description || null,
        p_genre: genre || null,
        p_logo_url: logoUrl || null,
      });

      if (error) throw error;

      await fetchBandData();
      return data as string;
    },
    [supabase, fetchBandData]
  );

  const joinBandWithCode = useCallback(
    async (code: string) => {
      const { data, error } = await supabase.rpc('join_band_with_code', {
        p_code: code,
      });

      if (error) throw error;

      await fetchBandData();
      return data as string;
    },
    [supabase, fetchBandData]
  );

  const switchBand = useCallback(
    async (bandId: string) => {
      const { error } = await supabase.rpc('switch_current_band', {
        p_band_id: bandId,
      });

      if (error) throw error;

      await fetchBandData();
    },
    [supabase, fetchBandData]
  );

  const generateSlug = useCallback((name: string): string => {
    // Generate slug locally
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove multiple hyphens
      .replace(/^-|-$/g, ''); // Trim hyphens

    // Add random suffix for uniqueness
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${slug}-${suffix}`;
  }, []);

  const needsOnboarding = !state.loading && !!state.profile && !state.profile.onboarding_completed;

  const hasRole = useCallback(
    (requiredRole: BandRole | BandRole[]): boolean => {
      if (!state.currentBand) return false;
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      return roles.includes(state.currentBand.role);
    },
    [state.currentBand]
  );

  const isAdmin = state.currentBand?.role === 'admin';
  const isEditor = state.currentBand?.role === 'admin' || state.currentBand?.role === 'editor';

  return {
    ...state,
    needsOnboarding,
    isAdmin,
    isEditor,
    hasRole,
    createBand,
    joinBandWithCode,
    switchBand,
    generateSlug,
    refresh: fetchBandData,
  };
}
