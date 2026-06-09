'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useBand } from '@/hooks/use-band';
import type { Profile, UserBand, BandRole } from '@/types/database';

interface BandContextValue {
  profile: Profile | null;
  bands: UserBand[];
  currentBand: UserBand | null;
  loading: boolean;
  error: string | null;
  needsOnboarding: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  hasRole: (role: BandRole | BandRole[]) => boolean;
  createBand: (
    name: string,
    slug: string,
    description?: string,
    genre?: string,
    logoUrl?: string
  ) => Promise<string>;
  joinBandWithCode: (code: string) => Promise<string>;
  switchBand: (bandId: string) => Promise<void>;
  generateSlug: (name: string) => string;
  refresh: () => Promise<void>;
}

const BandContext = createContext<BandContextValue | null>(null);

export function BandProvider({ children }: { children: ReactNode }) {
  const band = useBand();

  return <BandContext.Provider value={band}>{children}</BandContext.Provider>;
}

export function useBandContext() {
  const context = useContext(BandContext);
  if (!context) {
    throw new Error('useBandContext must be used within a BandProvider');
  }
  return context;
}
