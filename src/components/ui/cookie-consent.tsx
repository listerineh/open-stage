'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie, Check } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import {
  getLocalCookiePreferences,
  getCookiePreferences,
  saveCookiePreferences,
} from '@/lib/cookies/preferences';
import type { CookiePreferences } from '@/types/database';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(() =>
    getLocalCookiePreferences()
  );

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    let isMounted = true;
    let timer: NodeJS.Timeout | undefined;

    async function checkConsent() {
      try {
        const prefs = await getCookiePreferences();

        if (!isMounted) return;

        if (prefs === null) {
          // User hasn't accepted cookies yet - show banner
          timer = setTimeout(() => {
            if (isMounted) setIsVisible(true);
          }, 500);
        }
      } catch (error) {
        console.error('Error checking cookie consent:', error);
      }
    }

    checkConsent();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleAcceptAll = async () => {
    const allAccepted = { essential: true, functional: true, analytics: true };
    await saveCookiePreferences(allAccepted);
    setPreferences(allAccepted);
    setIsVisible(false);
  };

  const handleRejectAll = async () => {
    const onlyEssential = { essential: true, functional: false, analytics: false };
    await saveCookiePreferences(onlyEssential);
    setPreferences(onlyEssential);
    setIsVisible(false);
  };

  const handleSavePreferences = async () => {
    await saveCookiePreferences(preferences);
    setIsVisible(false);
    setShowSettings(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="border-t border-violet-500/20 bg-gradient-to-r from-zinc-950/98 via-violet-950/20 to-zinc-950/98 shadow-[0_-4px_20px_rgba(139,92,246,0.15)] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          {!showSettings ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/10 ring-1 ring-violet-500/20">
                  <Cookie className="h-5 w-5 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    🍪 Usamos cookies para mejorar tu experiencia
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    <Link
                      href="/cookies"
                      className="text-violet-400 hover:text-violet-300 underline"
                    >
                      Más información
                    </Link>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-sm font-medium text-zinc-400 transition-colors hover:text-violet-400"
                >
                  Configurar
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectAll}
                  className="border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
                >
                  Rechazar
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="bg-violet-600 font-medium shadow-lg shadow-violet-500/20 hover:bg-violet-500"
                >
                  ✓ Aceptar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Configurar cookies</p>
                <button
                  onClick={() => setShowSettings(false)}
                  className="rounded p-1 text-zinc-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2">
                  <span className="text-sm text-zinc-300">Esenciales</span>
                  <div className="flex h-5 w-9 items-center rounded-full bg-violet-600 px-0.5">
                    <div className="h-4 w-4 translate-x-4 rounded-full bg-white" />
                  </div>
                </div>

                <button
                  onClick={() => setPreferences(p => ({ ...p, functional: !p.functional }))}
                  className="flex items-center gap-3 rounded-lg border border-zinc-800 px-4 py-2 transition-colors hover:bg-zinc-900/50"
                >
                  <span className="text-sm text-zinc-300">Funcionales</span>
                  <div
                    className={cn(
                      'flex h-5 w-9 items-center rounded-full px-0.5 transition-colors',
                      preferences.functional ? 'bg-violet-600' : 'bg-zinc-700'
                    )}
                  >
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full bg-white transition-transform',
                        preferences.functional ? 'translate-x-4' : 'translate-x-0'
                      )}
                    />
                  </div>
                </button>

                <button
                  onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                  className="flex items-center gap-3 rounded-lg border border-zinc-800 px-4 py-2 transition-colors hover:bg-zinc-900/50"
                >
                  <span className="text-sm text-zinc-300">Analytics</span>
                  <div
                    className={cn(
                      'flex h-5 w-9 items-center rounded-full px-0.5 transition-colors',
                      preferences.analytics ? 'bg-violet-600' : 'bg-zinc-700'
                    )}
                  >
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full bg-white transition-transform',
                        preferences.analytics ? 'translate-x-4' : 'translate-x-0'
                      )}
                    />
                  </div>
                </button>

                <Button
                  size="sm"
                  onClick={handleSavePreferences}
                  className="bg-violet-600 hover:bg-violet-500"
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
