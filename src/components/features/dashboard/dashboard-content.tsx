'use client';

import Link from 'next/link';
import {
  Zap,
  BarChart3,
  Share2,
  Scissors,
  Video,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  Link2,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useBand } from '@/hooks/use-band';
import { useSocialConnections } from '@/hooks/use-social-connections';
import { PLATFORM_CONFIGS } from '@/lib/social/types';
import { PlatformIcon } from '@/components/features/analytics/platform-icon';
import type { SocialPlatform } from '@/types/database';
import { Logo } from '@/components/ui/logo';

interface DashboardContentProps {
  firstName: string;
}

const PLATFORMS: SocialPlatform[] = ['spotify', 'youtube', 'instagram', 'tiktok'];

const TOOLS = [
  {
    id: 'clip-generator',
    label: 'Generador de Clips',
    href: '/tools/clip-generator',
    icon: Video,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    badge: null,
    badgeColor: '',
    desc: 'Convierte videos de conciertos en clips virales para TikTok, Reels y Shorts.',
    ctaLabel: 'Abrir herramienta',
    ctaColor: 'bg-violet-600 hover:bg-violet-500',
  },
  {
    id: 'analytics',
    label: 'Analytics Dashboard',
    href: '/tools/analytics',
    icon: BarChart3,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    badge: 'Beta',
    badgeColor: 'bg-emerald-500/15 text-emerald-400',
    desc: 'Métricas unificadas de Spotify, YouTube, Instagram y TikTok.',
    ctaLabel: 'Ver analytics',
    ctaColor: 'bg-emerald-600 hover:bg-emerald-500',
  },
  {
    id: 'social-publisher',
    label: 'Social Publisher',
    href: null,
    icon: Share2,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    borderColor: 'border-zinc-800',
    badge: 'Próximamente',
    badgeColor: 'bg-zinc-800 text-zinc-500',
    desc: 'Publica y programa contenido en todas tus redes desde un solo lugar.',
    ctaLabel: null,
    ctaColor: '',
  },
  {
    id: 'clip-editor',
    label: 'Editor de Clips',
    href: null,
    icon: Scissors,
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/10',
    borderColor: 'border-zinc-800',
    badge: 'Próximamente',
    badgeColor: 'bg-zinc-800 text-zinc-500',
    desc: 'Edita clips con timeline visual, ajuste de audio y subtítulos personalizados.',
    ctaLabel: null,
    ctaColor: '',
  },
];

export function DashboardContent({ firstName }: DashboardContentProps) {
  const { currentBand, loading: bandLoading } = useBand();
  const {
    connections,
    loading: connectionsLoading,
    isConnected,
  } = useSocialConnections(currentBand?.id ?? null);

  const connectedCount = connections.length;
  const loading = bandLoading || connectionsLoading;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pt-22 sm:px-6 sm:py-10 md:px-8 lg:px-12 lg:pt-10">
      {/* Logo mobile */}
      <div className="mb-6 flex items-center gap-3 lg:hidden">
        <Logo size="lg" />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Bienvenido, {firstName}
        </h1>
        <p className="mt-2 text-base text-zinc-400 sm:text-lg">
          Tu plataforma todo-en-uno para gestionar contenido y redes sociales de tu banda
        </p>
      </div>

      {/* Quick Stats */}
      <section className="mt-8 sm:mt-10" data-tour="stats-section">
        <h2 className="text-lg font-medium text-white">Resumen</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                <Zap className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">0</p>
                <p className="text-xs text-zinc-500">Clips generados</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
                ) : (
                  <p className="text-2xl font-semibold text-white">{connectedCount}/4</p>
                )}
                <p className="text-xs text-zinc-500">Plataformas conectadas</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">
                  {currentBand ? currentBand.name.split(' ')[0] : '—'}
                </p>
                <p className="text-xs text-zinc-500">Banda activa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Widget */}
      <section className="mt-8" data-tour="analytics-section">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Analytics</h2>
          <Link
            href="/tools/analytics"
            className="flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Ver todo <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
            </div>
          ) : !currentBand ? (
            /* No band */
            <div className="p-6 text-center">
              <p className="text-sm text-zinc-400">
                Crea o únete a una banda para conectar tus plataformas sociales.
              </p>
              <Link
                href="/bands"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
              >
                Gestionar bandas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : connectedCount === 0 ? (
            /* No connections */
            <div className="p-6">
              <p className="text-sm text-zinc-400">
                Conecta tus cuentas para ver métricas unificadas de crecimiento.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PLATFORMS.map(platform => {
                  const cfg = PLATFORM_CONFIGS[platform];
                  return (
                    <div
                      key={platform}
                      className="flex flex-col items-center gap-2 rounded-lg border border-zinc-800 p-3"
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${cfg.bgColor} opacity-50`}
                      >
                        <PlatformIcon platform={platform} className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                      <span className="text-xs text-zinc-600">{cfg.name}</span>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/tools/analytics"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/20 px-4 py-2.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10"
              >
                <Link2 className="h-4 w-4" />
                Conectar plataformas
              </Link>
            </div>
          ) : (
            /* Has connections */
            <div className="divide-y divide-zinc-800">
              {PLATFORMS.map(platform => {
                const cfg = PLATFORM_CONFIGS[platform];
                const connected = isConnected(platform);
                return (
                  <div key={platform} className="flex items-center gap-3 px-5 py-3.5">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bgColor} ${!connected ? 'opacity-40' : ''}`}
                    >
                      <PlatformIcon platform={platform} className={`h-4 w-4 ${cfg.color}`} />
                    </div>
                    <span
                      className={`flex-1 text-sm font-medium ${connected ? 'text-white' : 'text-zinc-600'}`}
                    >
                      {cfg.name}
                    </span>
                    {connected ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Conectado
                      </span>
                    ) : (
                      <Link
                        href="/tools/analytics"
                        className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
                      >
                        Conectar
                      </Link>
                    )}
                  </div>
                );
              })}
              <div className="px-5 py-3">
                <Link
                  href="/tools/analytics"
                  className="flex items-center gap-1.5 text-sm text-emerald-400 transition-colors hover:text-emerald-300"
                >
                  Ver métricas completas <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tools Grid */}
      <section className="mt-8" data-tour="tools-section">
        <h2 className="text-lg font-medium text-white">Herramientas</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {TOOLS.map(tool => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className={`relative overflow-hidden rounded-xl border ${tool.borderColor} bg-zinc-900/50 p-5 transition-colors ${tool.href ? 'hover:border-zinc-700' : 'opacity-75'}`}
              >
                {tool.badge && (
                  <span
                    className={`absolute right-4 top-4 rounded-full px-2 py-0.5 text-[10px] font-medium ${tool.badgeColor}`}
                  >
                    {tool.badge}
                  </span>
                )}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${tool.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${tool.iconColor}`} />
                </div>
                <h3 className="mt-3 text-sm font-medium text-white">{tool.label}</h3>
                <p className="mt-1 text-xs text-zinc-500">{tool.desc}</p>
                {tool.href && tool.ctaLabel ? (
                  <Link
                    href={tool.href}
                    className={`mt-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors ${tool.ctaColor}`}
                  >
                    {tool.ctaLabel}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <p className="mt-4 text-xs text-zinc-700">Disponible próximamente</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Action */}
      <section className="mt-8 pb-8" data-tour="getting-started">
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-6">
          <h3 className="font-medium text-white">¡Crea tu primer clip viral!</h3>
          <p className="mt-1.5 text-sm text-zinc-400">
            Sube tu video de concierto y genera clips optimizados para TikTok, Reels y Shorts en
            minutos. 100% en tu navegador, sin marcas de agua.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/clip-generator"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
            >
              <Zap className="h-4 w-4" />
              Generar clips
            </Link>
            <Link
              href="/bands"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Gestionar bandas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
