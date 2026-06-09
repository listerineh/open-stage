import Link from 'next/link';
import { Film, Scissors, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-8 lg:px-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Resumen de tu actividad</p>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Film className="h-5 w-5 text-violet-400" />
            </div>
            <span className="text-3xl font-semibold text-white">0</span>
          </div>
          <p className="mt-4 text-sm font-medium text-white">Videos</p>
          <p className="mt-1 text-xs text-zinc-500">Videos agregados</p>
        </div>

        <div className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Scissors className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-3xl font-semibold text-white">0</span>
          </div>
          <p className="mt-4 text-sm font-medium text-white">Clips</p>
          <p className="mt-1 text-xs text-zinc-500">Clips generados</p>
        </div>
      </div>

      {/* Empty state */}
      <div className="mt-10 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
          <Film className="h-6 w-6 text-zinc-500" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-white">Sin videos aún</h3>
        <p className="mt-2 text-sm text-zinc-500">
          Agrega tu primer video para empezar a generar clips
        </p>
        <Link
          href="/create"
          className="mt-6 inline-flex items-center gap-2 text-sm text-violet-400 transition-colors hover:text-violet-300"
        >
          Crear clips
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
