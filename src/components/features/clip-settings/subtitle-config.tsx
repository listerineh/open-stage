'use client';

import { cn } from '@/lib/utils';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Check,
  Globe,
} from 'lucide-react';
import { SUBTITLE_STYLES, LANGUAGES, type SubtitleSettings } from '@/lib/constants';

interface SubtitleConfigProps {
  settings: SubtitleSettings;
  onChange: (settings: SubtitleSettings) => void;
}

export function SubtitleConfig({ settings, onChange }: SubtitleConfigProps) {
  const updateSetting = <K extends keyof SubtitleSettings>(key: K, value: SubtitleSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-8">
      {/* Toggle subtítulos */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
            <Type className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <p className="font-medium text-white">Subtítulos automáticos</p>
            <p className="mt-0.5 text-sm text-zinc-500">Genera subtítulos con IA usando Whisper</p>
          </div>
        </div>
        <button
          onClick={() => updateSetting('enabled', !settings.enabled)}
          className={cn(
            'relative h-6 w-11 rounded-full transition-colors',
            settings.enabled ? 'bg-violet-600' : 'bg-zinc-700'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
              settings.enabled && 'translate-x-5'
            )}
          />
        </button>
      </div>

      {settings.enabled && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
          {/* Estilo */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Estilo</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {SUBTITLE_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => updateSetting('style', style.id)}
                  className={cn(
                    'relative rounded-xl border p-4 text-left transition-all',
                    settings.style === style.id
                      ? 'border-violet-500/50 bg-violet-500/5'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">{style.name}</p>
                    {settings.style === style.id && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">{style.description}</p>
                  <div className="mt-3 rounded-lg bg-zinc-950 px-3 py-2">
                    <span className={style.preview}>Texto de ejemplo</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Posición */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Posición</h3>
            <div className="flex gap-2">
              {[
                { id: 'top', icon: ArrowUp, label: 'Arriba' },
                { id: 'center', icon: Minus, label: 'Centro' },
                { id: 'bottom', icon: ArrowDown, label: 'Abajo' },
              ].map(pos => (
                <button
                  key={pos.id}
                  onClick={() => updateSetting('position', pos.id as SubtitleSettings['position'])}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 transition-all',
                    settings.position === pos.id
                      ? 'border-violet-500/50 bg-violet-500/10 text-violet-400'
                      : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-white'
                  )}
                >
                  <pos.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{pos.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Alineación */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Alineación</h3>
            <div className="flex gap-2">
              {[
                { id: 'left', icon: AlignLeft },
                { id: 'center', icon: AlignCenter },
                { id: 'right', icon: AlignRight },
              ].map(align => (
                <button
                  key={align.id}
                  onClick={() =>
                    updateSetting('alignment', align.id as SubtitleSettings['alignment'])
                  }
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg border transition-all',
                    settings.alignment === align.id
                      ? 'border-violet-500/50 bg-violet-500/10 text-violet-400'
                      : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-white'
                  )}
                >
                  <align.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Idioma */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Idioma del audio</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => updateSetting('language', lang.code)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border px-4 py-3 transition-all',
                    settings.language === lang.code
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  )}
                >
                  <Globe
                    className={cn(
                      'h-4 w-4',
                      settings.language === lang.code ? 'text-violet-400' : 'text-zinc-500'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      settings.language === lang.code ? 'text-white' : 'text-zinc-400'
                    )}
                  >
                    {lang.name}
                  </span>
                  {settings.language === lang.code && (
                    <Check className="ml-auto h-4 w-4 text-violet-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
