import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Upload, Users, Film, Scissors } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-2 text-zinc-400">Bienvenido, {user.email}</p>
          </div>
          <Link
            href="/upload"
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            <Upload className="h-4 w-4" />
            Subir Video
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-500/10 p-2">
                <Users className="h-5 w-5 text-violet-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Mis Bandas</h2>
            </div>
            <p className="mt-2 text-sm text-zinc-400">Gestiona tus bandas y equipos</p>
            <p className="mt-4 text-3xl font-bold text-violet-400">0</p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Film className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Videos</h2>
            </div>
            <p className="mt-2 text-sm text-zinc-400">Videos subidos</p>
            <p className="mt-4 text-3xl font-bold text-blue-400">0</p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <Scissors className="h-5 w-5 text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Clips</h2>
            </div>
            <p className="mt-2 text-sm text-zinc-400">Clips generados</p>
            <p className="mt-4 text-3xl font-bold text-green-400">0</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-md bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
