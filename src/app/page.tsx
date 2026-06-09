import Link from 'next/link';
import { Sparkles, Film, Zap, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-12 md:px-8 lg:px-12">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">OpenStage</span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            Iniciar sesión
          </Link>
        </header>

        {/* Hero */}
        <main className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-sm text-violet-300">Potenciado por IA</span>
          </div>

          <h1 className="mt-8 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Genera clips virales de tus{' '}
            <span className="bg-linear-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
              conciertos
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-zinc-400">
            Sube tu video, elige el formato y deja que la IA detecte los mejores momentos. Clips
            listos para TikTok, Reels y YouTube Shorts en minutos.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500"
            >
              Comenzar gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
            >
              Ya tengo cuenta
            </Link>
          </div>

          {/* Features */}
          <div className="mt-20 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Film,
                title: 'Múltiples formatos',
                description: 'TikTok, Reels, Shorts, Instagram y YouTube',
              },
              {
                icon: Sparkles,
                title: 'Procesamiento en navegador',
                description: 'FFmpeg WASM - sin servidores externos',
              },
              {
                icon: Zap,
                title: 'Descarga directa',
                description: 'Clips listos para publicar al instante',
              },
            ].map(feature => (
              <div
                key={feature.title}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                  <feature.icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="mt-4 font-medium text-white">{feature.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto pt-12 text-center">
          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} OpenStage. Hecho para músicos.
          </p>
        </footer>
      </div>
    </div>
  );
}
