import Link from 'next/link';
import {
  Sparkles,
  Zap,
  ArrowRight,
  Heart,
  Video,
  BarChart3,
  Share2,
  Scissors,
  CheckCircle,
  Play,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Video,
    title: 'Generador de Clips',
    description:
      'Crea clips virales automáticamente desde tus videos de conciertos. Múltiples formatos para TikTok, Reels y Shorts.',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    available: true,
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description:
      'Visualiza métricas de Spotify, YouTube, TikTok e Instagram en un solo lugar con gráficos de crecimiento.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    available: false,
  },
  {
    icon: Share2,
    title: 'Social Publisher',
    description:
      'Publica directamente a todas tus redes sociales. Programa publicaciones y gestiona tu calendario.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    available: false,
  },
  {
    icon: Scissors,
    title: 'Editor de Clips',
    description:
      'Edita tus clips con un timeline intuitivo. Recorta, ajusta volumen y agrega subtítulos.',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    available: false,
  },
];

const BENEFITS = [
  'Sin límites de clips generados',
  'Procesamiento 100% en tu navegador',
  'Sin marcas de agua',
  'Múltiples formatos de salida',
  'Subtítulos automáticos',
  'Descarga masiva en ZIP',
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 md:px-8 lg:px-12">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">OpenStage</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/listerineh/ia-content-creator"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-sm font-medium text-zinc-400 transition-colors hover:text-white sm:block"
            >
              GitHub
            </a>
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
            >
              Comenzar gratis
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero Section */}
          <section className="flex min-h-[70vh] flex-col items-center justify-center py-16 text-center lg:min-h-[75vh] lg:py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5">
              <Zap className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">
                🇪🇨 Plataforma ecuatoriana Open Source
              </span>
            </div>

            <h1 className="mt-8 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              La plataforma{' '}
              <span className="bg-linear-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                todo-en-uno
              </span>{' '}
              para tu banda
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
              Herramientas gratuitas para crear contenido viral, analizar métricas y crecer en redes
              sociales. Todo lo que necesitas para llevar tu música al siguiente nivel.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-8 py-4 text-base font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-500 hover:shadow-violet-500/40"
              >
                Comenzar gratis
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#features"
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-8 py-4 text-base font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
              >
                <Play className="h-4 w-4" />
                Ver cómo funciona
              </Link>
            </div>
          </section>

          {/* Screenshot/Preview Section */}
          <section className="py-16">
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-4 text-xs text-zinc-500">
                  openstage.online/tools/clip-generator
                </span>
              </div>
              <div className="relative aspect-video bg-zinc-900 p-8">
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/10">
                    <Video className="h-10 w-10 text-violet-400" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-white">Generador de Clips</h3>
                  <p className="mt-2 max-w-md text-zinc-500">
                    Sube tu video de concierto, selecciona los formatos y genera clips virales en
                    minutos. Todo procesado en tu navegador.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {['TikTok', 'Reels', 'Shorts', 'Instagram', 'YouTube'].map(format => (
                      <span
                        key={format}
                        className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section id="features" className="py-20">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Herramientas para cada necesidad
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                Una suite completa de herramientas diseñadas específicamente para músicos y bandas
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {FEATURES.map(feature => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all hover:border-zinc-700"
                >
                  {!feature.available && (
                    <div className="absolute right-4 top-4 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-500">
                      Próximamente
                    </div>
                  )}
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl ${feature.bgColor}`}
                  >
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-zinc-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-20">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Todo lo que necesitas, sin costos ocultos
                </h2>
                <p className="mt-4 text-lg text-zinc-400">
                  OpenStage es completamente gratuito y open source. Sin límites, sin marcas de
                  agua, sin suscripciones.
                </p>
                <ul className="mt-8 space-y-4">
                  {BENEFITS.map(benefit => (
                    <li key={benefit} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
                      <span className="text-zinc-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500"
                  >
                    Crear cuenta gratis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-xl bg-zinc-800/50 p-6 text-center">
                    <div className="text-4xl font-bold text-white">∞</div>
                    <div className="mt-2 text-sm text-zinc-400">Clips ilimitados</div>
                  </div>
                  <div className="rounded-xl bg-zinc-800/50 p-6 text-center">
                    <div className="text-4xl font-bold text-white">$0</div>
                    <div className="mt-2 text-sm text-zinc-400">Para siempre</div>
                  </div>
                  <div className="rounded-xl bg-zinc-800/50 p-6 text-center">
                    <div className="text-4xl font-bold text-white">5+</div>
                    <div className="mt-2 text-sm text-zinc-400">Formatos de salida</div>
                  </div>
                  <div className="rounded-xl bg-zinc-800/50 p-6 text-center">
                    <div className="text-4xl font-bold text-violet-400">100%</div>
                    <div className="mt-2 text-sm text-zinc-400">Open Source</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <div className="rounded-3xl border border-violet-500/20 bg-linear-to-br from-violet-500/10 to-purple-500/10 p-12 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                ¿Listo para llevar tu banda al siguiente nivel?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
                Únete a OpenStage y empieza a crear contenido viral para tu banda hoy mismo.
                Completamente gratis.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-8 py-4 text-base font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-500 hover:shadow-violet-500/40"
                >
                  Comenzar gratis
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="https://github.com/listerineh/ia-content-creator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-8 py-4 text-base font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                >
                  Ver en GitHub
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800 py-10">
          <div className="flex flex-col items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">OpenStage</span>
            </div>

            {/* Made with love */}
            <p className="flex items-center gap-1.5 text-sm text-zinc-400">
              Hecho con <Heart className="h-4 w-4 text-red-500" /> para músicos por{' '}
              <a
                href="https://listerineh.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-violet-400 transition-colors hover:text-violet-300"
              >
                listerineh
              </a>
            </p>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <a
                href="https://github.com/listerineh/ia-content-creator"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                GitHub
              </a>
              <span className="text-zinc-700">•</span>
              <span>MIT License</span>
            </div>

            {/* Copyright */}
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} OpenStage. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
