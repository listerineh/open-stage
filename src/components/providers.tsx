'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { BandProvider } from '@/contexts/band-context';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <BandProvider>{children}</BandProvider>
    </AuthProvider>
  );
}
