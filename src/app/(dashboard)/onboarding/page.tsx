'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogoIcon } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { useBand } from '@/hooks/use-band';
import { Users, Plus, ArrowRight, Loader2, Music, Ticket, AlertCircle } from 'lucide-react';
import { LogoUpload } from '@/components/ui/logo-upload';

type OnboardingStep = 'choice' | 'create' | 'join';

const GENRES = [
  'Rock',
  'Pop',
  'Metal',
  'Jazz',
  'Blues',
  'Reggae',
  'Hip Hop',
  'Electrónica',
  'Folk',
  'Indie',
  'Punk',
  'Otro',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { createBand, joinBandWithCode, generateSlug } = useBand();

  const [step, setStep] = useState<OnboardingStep>('choice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create band form
  const [bandName, setBandName] = useState('');
  const [bandGenre, setBandGenre] = useState('');
  const [bandDescription, setBandDescription] = useState('');
  const [bandLogoUrl, setBandLogoUrl] = useState<string | null>(null);

  // Join band form
  const [inviteCode, setInviteCode] = useState('');

  const handleCreateBand = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const slug = generateSlug(bandName);
      await createBand(
        bandName,
        slug,
        bandDescription || undefined,
        bandGenre || undefined,
        bandLogoUrl || undefined
      );
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la banda');
      setLoading(false);
    }
  };

  const handleJoinBand = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await joinBandWithCode(inviteCode);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código de invitación inválido');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="mb-4 inline-block">
            <LogoIcon size={56} className="drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-white">Bienvenido a </span>
            <span className="text-white">Open</span>
            <span className="text-violet-400">Stage</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            {step === 'choice' && 'Para comenzar, crea o únete a una banda'}
            {step === 'create' && 'Crea tu banda y empieza a crear contenido'}
            {step === 'join' && 'Ingresa el código de invitación de tu banda'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Choice step */}
        {step === 'choice' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setStep('create')}
              className="group flex w-full items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left transition-all hover:border-violet-500/50 hover:bg-zinc-900"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/10 transition-colors group-hover:bg-violet-500/20">
                <Plus className="h-7 w-7 text-violet-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Crear nueva banda</h3>
                <p className="mt-1 text-sm text-zinc-500">Soy el líder o manager de mi banda</p>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-600 transition-colors group-hover:text-violet-400" />
            </button>

            <button
              onClick={() => setStep('join')}
              className="group flex w-full items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left transition-all hover:border-emerald-500/50 hover:bg-zinc-900"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20">
                <Users className="h-7 w-7 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Unirme a una banda</h3>
                <p className="mt-1 text-sm text-zinc-500">Tengo un código de invitación</p>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-600 transition-colors group-hover:text-emerald-400" />
            </button>
          </div>
        )}

        {/* Create band step */}
        {step === 'create' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleCreateBand} className="space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="space-y-4">
                  {/* Logo */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-400">
                      Logo de la banda
                    </label>
                    <LogoUpload
                      currentLogoUrl={bandLogoUrl}
                      onUpload={url => setBandLogoUrl(url)}
                      onRemove={() => setBandLogoUrl(null)}
                    />
                  </div>

                  {/* Band name */}
                  <div className="space-y-2">
                    <label htmlFor="bandName" className="block text-sm font-medium text-zinc-400">
                      Nombre de la banda *
                    </label>
                    <div className="relative">
                      <Music className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600" />
                      <input
                        id="bandName"
                        type="text"
                        value={bandName}
                        onChange={e => setBandName(e.target.value)}
                        required
                        placeholder="Ej: Los Amplificados"
                        className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-4 text-white placeholder-zinc-600 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>
                  </div>

                  {/* Genre */}
                  <div className="space-y-2">
                    <label htmlFor="bandGenre" className="block text-sm font-medium text-zinc-400">
                      Género musical
                    </label>
                    <select
                      id="bandGenre"
                      value={bandGenre}
                      onChange={e => setBandGenre(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    >
                      <option value="">Selecciona un género</option>
                      {GENRES.map(genre => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label
                      htmlFor="bandDescription"
                      className="block text-sm font-medium text-zinc-400"
                    >
                      Descripción
                    </label>
                    <textarea
                      id="bandDescription"
                      value={bandDescription}
                      onChange={e => setBandDescription(e.target.value)}
                      placeholder="Cuéntanos sobre tu banda..."
                      rows={3}
                      className="block w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep('choice');
                    setError(null);
                  }}
                  className="flex-1 border-zinc-800 bg-transparent hover:bg-zinc-800/50"
                  disabled={loading}
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-500"
                  disabled={loading || !bandName.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Crear banda
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Join band step */}
        {step === 'join' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleJoinBand} className="space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="space-y-2">
                  <label htmlFor="inviteCode" className="block text-sm font-medium text-zinc-400">
                    Código de invitación
                  </label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600" />
                    <input
                      id="inviteCode"
                      type="text"
                      value={inviteCode}
                      onChange={e => setInviteCode(e.target.value.toUpperCase())}
                      required
                      placeholder="Ej: ABC12345"
                      maxLength={8}
                      className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-4 font-mono text-lg uppercase tracking-widest text-white placeholder-zinc-600 transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <p className="text-xs text-zinc-600">
                    Pide el código a un administrador de la banda
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep('choice');
                    setError(null);
                  }}
                  className="flex-1 border-zinc-800 bg-transparent hover:bg-zinc-800/50"
                  disabled={loading}
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                  disabled={loading || inviteCode.length < 6}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Unirme
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
