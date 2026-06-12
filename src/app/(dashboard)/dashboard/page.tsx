import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, Users, Zap } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { createClient } from '@/lib/supabase/server';
import { DashboardTour } from '@/components/features/tours/dashboard-tour';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Panel de control de OpenStage para gestionar tu banda y contenido.',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';
  const firstName = fullName.split(' ')[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pt-22 sm:px-6 sm:py-10 md:px-8 lg:px-12 lg:pt-10">
      <DashboardTour />

      {/* Page Header */}
      <div>
        {/* Logo solo en mobile */}
        <div className="mb-6 flex items-center gap-3 lg:hidden">
          <Logo size="lg" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Bienvenido, {firstName}
        </h1>
        <p className="mt-2 text-base text-zinc-400 sm:text-lg">
          Tu plataforma todo-en-uno para gestionar contenido y redes sociales de tu banda
        </p>
      </div>

      {/* Quick Stats */}
      <section className="mt-8 sm:mt-10" data-tour="stats-section">
        <h2 className="text-xl font-medium text-white sm:text-lg">Resumen</h2>
        <div className="mt-6 grid gap-5 sm:mt-4 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 sm:h-10 sm:w-10 sm:rounded-lg">
                <Zap className="h-7 w-7 text-violet-400 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-3xl font-semibold text-white sm:text-2xl">0</p>
                <p className="mt-1 text-sm text-zinc-500 sm:mt-0 sm:text-xs">Clips generados</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 sm:h-10 sm:w-10 sm:rounded-lg">
                <TrendingUp className="h-7 w-7 text-emerald-400 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-3xl font-semibold text-white sm:text-2xl">-</p>
                <p className="mt-1 text-sm text-zinc-500 sm:mt-0 sm:text-xs">Alcance total</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 sm:h-10 sm:w-10 sm:rounded-lg">
                <Users className="h-7 w-7 text-blue-400 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-3xl font-semibold text-white sm:text-2xl">-</p>
                <p className="mt-1 text-sm text-zinc-500 sm:mt-0 sm:text-xs">Seguidores</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="mt-10" data-tour="getting-started">
        <h2 className="text-lg font-medium text-white">Comienza ahora</h2>
        <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-6">
          <h3 className="font-medium text-white">¡Crea tu primer clip viral!</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Usa el Generador de Clips para convertir tus videos en contenido optimizado para redes
            sociales. Soporta TikTok, Reels, Shorts y más.
          </p>
          <div className="mt-4 flex gap-3">
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

      {/* Activity (placeholder) */}
      <section className="mt-10">
        <h2 className="text-lg font-medium text-white">Actividad reciente</h2>
        <div className="mt-4 rounded-xl border border-dashed border-zinc-800 p-8 text-center">
          <p className="text-sm text-zinc-500">No hay actividad reciente</p>
          <p className="mt-1 text-xs text-zinc-600">Tus clips y publicaciones aparecerán aquí</p>
        </div>
      </section>
    </div>
  );
}
