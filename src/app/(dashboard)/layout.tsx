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
        <footer className="border-t border-zinc-800/50 bg-zinc-950">
          <div className="px-4 py-6 sm:px-6 md:px-8 lg:px-12">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              {/* Made with love */}
              <p className="flex items-center gap-1.5 text-sm text-zinc-500">
                Hecho con ❤️ para músicos por{' '}
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
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <a
                  href="https://github.com/listerineh/open-stage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  GitHub
                </a>
                <span className="text-zinc-700">•</span>
                <span>MIT License</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
