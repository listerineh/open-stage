import Image from 'next/image';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Sparkles, LayoutDashboard, Plus, ChevronDown, LogOut, User } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const initials = fullName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 md:px-8 lg:px-12">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">OpenStage</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/create"
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
            >
              <Plus className="h-4 w-4" />
              Crear
            </Link>
          </nav>

          {/* User Menu */}
          <div className="group relative">
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-800/50">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm font-medium text-white">
                  {initials}
                </div>
              )}
              <span className="hidden text-sm text-zinc-300 sm:block">{fullName}</span>
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </button>

            {/* Dropdown */}
            <div className="invisible absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
              <div className="border-b border-zinc-800 px-3 py-2">
                <p className="text-sm font-medium text-white">{fullName}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
              </div>
              <div className="mt-2 space-y-1">
                <Link
                  href="/settings"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <User className="h-4 w-4" />
                  Mi cuenta
                </Link>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 bg-zinc-950">
        <div className="mx-auto max-w-5xl px-6 py-8 md:px-8 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* Logo & Description */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20">
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">OpenStage</p>
                <p className="text-xs text-zinc-500">Clips virales para músicos</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link href="/help" className="text-zinc-500 transition-colors hover:text-white">
                Ayuda
              </Link>
              <Link href="/privacy" className="text-zinc-500 transition-colors hover:text-white">
                Privacidad
              </Link>
              <Link href="/terms" className="text-zinc-500 transition-colors hover:text-white">
                Términos
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-xs text-zinc-600">© {new Date().getFullYear()} OpenStage</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
