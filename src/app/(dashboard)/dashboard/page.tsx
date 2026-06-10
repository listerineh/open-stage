import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { TOOL_CATEGORIES, getAvailableTools, getComingSoonTools } from '@/lib/tools';
import { ToolCard } from '@/components/tools';

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'Accede a todas las herramientas de OpenStage para crear contenido viral para tu banda.',
};

export default function DashboardPage() {
  const availableTools = getAvailableTools();
  const comingSoonTools = getComingSoonTools();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pt-16 sm:px-6 sm:py-10 md:px-8 lg:px-12 lg:pt-10">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Bienvenido a OpenStage
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Selecciona una herramienta para comenzar</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
          <Sparkles className="h-5 w-5 text-violet-400" />
        </div>
      </div>

      {/* Available Tools */}
      <section className="mt-10">
        <h2 className="text-lg font-medium text-white">Herramientas disponibles</h2>
        <p className="mt-1 text-sm text-zinc-500">Empieza a usar estas herramientas ahora</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="mt-12">
        <h2 className="text-lg font-medium text-white">Próximamente</h2>
        <p className="mt-1 text-sm text-zinc-500">Estamos trabajando en más herramientas</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comingSoonTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} variant="compact" />
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="mt-12">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="text-sm font-medium text-zinc-400">Resumen</h3>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            <div>
              <div className="text-2xl font-bold text-white">{availableTools.length}</div>
              <div className="text-sm text-zinc-500">Herramientas activas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{comingSoonTools.length}</div>
              <div className="text-sm text-zinc-500">En desarrollo</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {Object.keys(TOOL_CATEGORIES).length}
              </div>
              <div className="text-sm text-zinc-500">Categorías</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
