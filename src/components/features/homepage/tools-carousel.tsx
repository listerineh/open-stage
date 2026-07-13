'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Video,
  BarChart3,
  Share2,
  Scissors,
  Play,
  ArrowRight,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';

const TOOLS = [
  {
    id: 'clip-generator',
    label: 'Generador de Clips',
    url: 'openstage.online/tools/clip-generator',
    href: '/tools/clip-generator',
    ctaLabel: 'Probar ahora',
    status: 'available' as const,
    icon: Video,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    accentBorder: 'border-zinc-800',
    accentGlow: '',
    badgeText: null,
    description:
      'Sube tu video de concierto, selecciona los formatos y genera clips virales en minutos.',
    tags: ['TikTok', 'Reels', 'Shorts'],
    tagColor: 'bg-violet-500/10 text-violet-400',
    ctaColor: 'bg-violet-600 hover:bg-violet-500',
    bottomFeatures: ['100% en navegador', 'Sin marcas de agua', 'Subtítulos automáticos'],
    visual: 'phones' as const,
  },
  {
    id: 'analytics',
    label: 'Analytics Dashboard',
    url: 'openstage.online/tools/analytics',
    href: '/tools/analytics',
    ctaLabel: 'Ver dashboard',
    status: 'beta' as const,
    icon: BarChart3,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/20',
    accentGlow: '',
    badgeText: 'Beta',
    badgeColor: 'bg-emerald-500/15 text-emerald-400',
    description:
      'Conecta Spotify, YouTube, Instagram y TikTok. Histórico de 30 días y tendencias de crecimiento.',
    tags: ['Spotify', 'YouTube', 'Instagram', 'TikTok'],
    tagColor: 'bg-emerald-500/10 text-emerald-400',
    ctaColor: 'bg-emerald-600 hover:bg-emerald-500',
    bottomFeatures: ['Auto-sync cada 6h', 'Histórico 30 días', 'Sync manual disponible'],
    visual: 'metrics' as const,
  },
  {
    id: 'social-publisher',
    label: 'Social Publisher',
    url: 'openstage.online/tools/social-publisher',
    href: null,
    ctaLabel: null,
    status: 'soon' as const,
    icon: Share2,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    accentBorder: 'border-blue-500/20',
    accentGlow: '',
    badgeText: 'Próximamente',
    badgeColor: 'bg-zinc-800 text-zinc-500',
    description:
      'Publica directamente a todas tus redes sociales. Programa publicaciones y gestiona tu calendario de contenido.',
    tags: ['TikTok', 'Instagram', 'YouTube', 'X'],
    tagColor: 'bg-blue-500/10 text-blue-400',
    ctaColor: '',
    bottomFeatures: ['Programación automática', 'Calendario visual', 'Estado de publicaciones'],
    visual: 'calendar' as const,
  },
  {
    id: 'clip-editor',
    label: 'Editor de Clips',
    url: 'openstage.online/tools/clip-editor',
    href: null,
    ctaLabel: null,
    status: 'soon' as const,
    icon: Scissors,
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/10',
    accentBorder: 'border-pink-500/20',
    accentGlow: '',
    badgeText: 'Próximamente',
    badgeColor: 'bg-zinc-800 text-zinc-500',
    description:
      'Edita tus clips con un timeline intuitivo. Recorta, ajusta volumen y agrega subtítulos personalizados.',
    tags: ['Timeline', 'Subtítulos', 'Exportar'],
    tagColor: 'bg-pink-500/10 text-pink-400',
    ctaColor: '',
    bottomFeatures: ['Timeline visual', 'Ajuste de audio', 'Exportación directa'],
    visual: 'scissors' as const,
  },
];

function PhonesVisual() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative">
        <div className="relative z-10 w-36 rounded-2xl border-2 border-zinc-700 bg-zinc-800 p-1.5 shadow-xl">
          <div className="aspect-9/16 rounded-xl bg-linear-to-br from-violet-900/50 to-zinc-900">
            <div className="flex h-full flex-col items-center justify-center">
              <Play className="h-8 w-8 text-violet-400" />
              <div className="mt-4 space-y-1 px-3">
                <div className="h-1.5 w-full rounded bg-zinc-700" />
                <div className="h-1.5 w-3/4 rounded bg-zinc-700" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-12 top-6 z-0 w-28 rotate-6 rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-1 opacity-70">
          <div className="aspect-9/16 rounded-lg bg-linear-to-br from-pink-900/30 to-zinc-900">
            <div className="flex h-full items-center justify-center">
              <Play className="h-5 w-5 text-pink-400/60" />
            </div>
          </div>
        </div>
        <div className="absolute -left-10 top-10 z-0 w-24 -rotate-6 rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-1 opacity-50">
          <div className="aspect-9/16 rounded-lg bg-linear-to-br from-blue-900/30 to-zinc-900">
            <div className="flex h-full items-center justify-center">
              <Play className="h-4 w-4 text-blue-400/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricsVisual() {
  const platforms = [
    { name: 'Spotify', val: '12.1K', color: 'bg-emerald-500', pct: '52%' },
    { name: 'YouTube', val: '8.4K', color: 'bg-red-500', pct: '43%' },
    { name: 'Instagram', val: '18.7K', color: 'bg-pink-500', pct: '72%' },
    { name: 'TikTok', val: '9.1K', color: 'bg-cyan-500', pct: '48%' },
  ];
  return (
    <div className="flex flex-col justify-center gap-3">
      <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
            <Users className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <p className="text-xl font-semibold text-white">48.3K</p>
            <p className="text-xs text-zinc-500">Seguidores totales</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs font-medium text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            +5.2%
          </div>
        </div>
      </div>
      {platforms.map(p => (
        <div key={p.name} className="flex items-center gap-3">
          <div className={`h-2 w-2 shrink-0 rounded-full ${p.color}`} />
          <span className="text-xs text-zinc-400">{p.name}</span>
          <div className="flex-1 overflow-hidden rounded-full bg-zinc-800">
            <div className={`h-1.5 rounded-full ${p.color} opacity-60`} style={{ width: p.pct }} />
          </div>
          <span className="text-xs font-medium text-white">{p.val}</span>
        </div>
      ))}
    </div>
  );
}

function CalendarVisual() {
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const posts = [2, 5, 8, 12, 15, 19, 22];
  return (
    <div className="flex flex-col justify-center gap-3">
      <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Calendar className="h-3.5 w-3.5 text-blue-400" />
          <span>Julio 2026</span>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center">
          {days.map(d => (
            <div key={d} className="text-[10px] font-medium text-zinc-600">
              {d}
            </div>
          ))}
          {Array.from({ length: 28 }, (_, i) => (
            <div
              key={i}
              className={`flex h-6 w-6 items-center justify-center rounded text-[10px] ${
                posts.includes(i + 1) ? 'bg-blue-500/20 font-medium text-blue-400' : 'text-zinc-500'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-zinc-500">4 publicaciones programadas esta semana</p>
    </div>
  );
}

function ScissorsVisual() {
  return (
    <div className="flex flex-col justify-center gap-3">
      <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-4">
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-zinc-700">
          <div className="h-full w-3/5 rounded-full bg-pink-500/60" />
        </div>
        <div className="space-y-1.5">
          {['Pista de audio', 'Subtítulos', 'Video'].map((track, i) => (
            <div key={track} className="flex items-center gap-2">
              <span className="w-16 text-right text-[10px] text-zinc-500">{track}</span>
              <div className="flex-1 rounded bg-zinc-700 p-0.5">
                <div
                  className="h-3 rounded bg-pink-500/30"
                  style={{ width: `${65 - i * 12}%`, marginLeft: `${i * 8}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-zinc-500">Timeline visual con arrastre y recorte</p>
    </div>
  );
}

function ToolVisual({ type }: { type: (typeof TOOLS)[number]['visual'] }) {
  if (type === 'phones') return <PhonesVisual />;
  if (type === 'metrics') return <MetricsVisual />;
  if (type === 'calendar') return <CalendarVisual />;
  return <ScissorsVisual />;
}

export function ToolsCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      if (animating) return;
      setAnimating(true);
      setCurrent((idx + TOOLS.length) % TOOLS.length);
      setTimeout(() => setAnimating(false), 300);
    },
    [animating]
  );

  useEffect(() => {
    const id = setInterval(() => goTo(current + 1), 6000);
    return () => clearInterval(id);
  }, [current, goTo]);

  const tool = TOOLS[current];
  const Icon = tool.icon;

  return (
    <div className="relative mx-auto max-w-4xl">
      {/* Card */}
      <div
        className={`overflow-hidden rounded-2xl border ${tool.accentBorder} bg-zinc-900/90 shadow-2xl backdrop-blur-sm transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* Browser header */}
        <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-4 text-xs text-zinc-500">{tool.url}</span>
          {tool.badgeText && (
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${tool.badgeColor}`}
            >
              {tool.badgeText}
            </span>
          )}
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
          {/* Left */}
          <div className="flex flex-col justify-center">
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${tool.iconBg}`}>
              <Icon className={`h-7 w-7 ${tool.iconColor}`} />
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-white">{tool.label}</h3>
            <p className="mt-2 text-zinc-400">{tool.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {tool.tags.map(tag => (
                <span
                  key={tag}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${tool.tagColor}`}
                >
                  {tag}
                </span>
              ))}
            </div>
            {tool.href && tool.ctaLabel && (
              <Link
                href={tool.href}
                className={`mt-6 inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${tool.ctaColor}`}
              >
                {tool.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {!tool.href && <p className="mt-6 text-sm text-zinc-600">Disponible próximamente</p>}
          </div>

          {/* Right */}
          <ToolVisual type={tool.visual} />
        </div>

        {/* Bottom bar */}
        <div className="flex items-center gap-6 border-t border-zinc-800 bg-zinc-900/50 px-6 py-3 md:px-8">
          {tool.bottomFeatures.map((f, i) => (
            <span
              key={f}
              className={`${i === 2 ? 'hidden sm:flex' : 'flex'} items-center gap-1.5 text-xs text-zinc-500`}
            >
              <CheckCircle className={`h-3.5 w-3.5 ${tool.iconColor}`} />
              {f}
            </span>
          ))}
          {tool.id === 'analytics' && (
            <span className="hidden items-center gap-1.5 text-xs text-zinc-500 sm:flex">
              <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
              Sync manual disponible
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={() => goTo(current - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          {TOOLS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => goTo(i)}
              aria-label={t.label}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-white' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(current + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Tool name indicator */}
      <p className="mt-3 text-center text-xs text-zinc-600">
        {current + 1} / {TOOLS.length} — {tool.label}
      </p>
    </div>
  );
}
