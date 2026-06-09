import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus, Film, Scissors, ArrowRight } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'Usuario';

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-5xl px-6 py-10 md:px-8 lg:px-12">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500">Bienvenido de vuelta</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">{firstName}</h1>
          </div>
          <Link
            href="/create"
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            <Plus className="h-4 w-4" />
            Crear clips
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
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

        {/* Footer */}
        <div className="mt-10 flex items-center justify-between border-t border-zinc-800/50 pt-6">
          <p className="text-xs text-zinc-600">{user.email}</p>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-xs text-zinc-500 transition-colors hover:text-white"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
