import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout';

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
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <Sidebar
        user={{
          email: user.email || '',
          fullName,
          avatarUrl,
          initials,
        }}
      />

      {/* Main Content */}
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="mt-auto border-t border-zinc-800/50">
          <div className="px-4 py-4 sm:px-6 md:px-8 lg:px-12">
            <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:justify-between">
              <p className="text-xs text-zinc-600">© 2026 OpenStage · Hecho con ❤️ para músicos</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600">
                <a
                  href="https://github.com/listerineh/open-stage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-zinc-400"
                >
                  GitHub
                </a>
                <span>·</span>
                <a
                  href="https://listerineh.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-zinc-400"
                >
                  @listerineh
                </a>
                <span>·</span>
                <Link href="/privacy" className="transition-colors hover:text-zinc-400">
                  Privacidad
                </Link>
                <span>·</span>
                <Link href="/terms" className="transition-colors hover:text-zinc-400">
                  Términos
                </Link>
                <span>·</span>
                <Link href="/cookies" className="transition-colors hover:text-zinc-400">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
