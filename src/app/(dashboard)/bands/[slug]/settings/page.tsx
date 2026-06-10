'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, Trash2, Copy, Check, Plus, AlertTriangle } from 'lucide-react';
import { LogoUpload } from '@/components/ui/logo-upload';
import { DriveConnect } from '@/components/features/drive';
import type { Band, BandInvitation } from '@/types/database';

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

export default function BandSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const supabase = createClient();

  const [band, setBand] = useState<Band | null>(null);
  const [invitations, setInvitations] = useState<BandInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch band
      const { data: bandData } = await supabase.from('bands').select('*').eq('slug', slug).single();

      if (!bandData) {
        setLoading(false);
        return;
      }

      setBand(bandData);
      setName(bandData.name);
      setDescription(bandData.description || '');
      setGenre(bandData.genre || '');
      setLogoUrl(bandData.logo_url || null);

      // Fetch invitations
      const { data: invitationsData } = await supabase
        .from('band_invitations')
        .select('*')
        .eq('band_id', bandData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setInvitations(invitationsData || []);
      setLoading(false);
    };

    fetchData();
  }, [slug, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!band) return;

    setSaving(true);
    setSaveMessage(null);

    const { error } = await supabase
      .from('bands')
      .update({
        name,
        description: description || null,
        genre: genre || null,
        logo_url: logoUrl,
      })
      .eq('id', band.id);

    if (error) {
      setSaveMessage({ type: 'error', text: 'Error al guardar los cambios' });
    } else {
      setBand({ ...band, name, description, genre, logo_url: logoUrl });
      setSaveMessage({ type: 'success', text: 'Cambios guardados correctamente' });
      setTimeout(() => setSaveMessage(null), 3000);
    }

    setSaving(false);
  };

  const handleCreateInvitation = async () => {
    if (!band) return;

    setCreatingInvite(true);

    // Generate code
    const { data: code } = await supabase.rpc('generate_invitation_code');

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('band_invitations')
      .insert({
        band_id: band.id,
        code,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (!error && invitation) {
      setInvitations([invitation, ...invitations]);
    }

    setCreatingInvite(false);
  };

  const handleDeactivateInvitation = async (invitationId: string) => {
    await supabase.from('band_invitations').update({ is_active: false }).eq('id', invitationId);

    setInvitations(invitations.filter(i => i.id !== invitationId));
  };

  const handleDeleteBand = async () => {
    if (!band) return;

    setDeleting(true);

    const { error } = await supabase.from('bands').delete().eq('id', band.id);

    if (!error) {
      router.push('/bands');
    } else {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!band) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 text-center">
        <h1 className="text-xl font-semibold text-white">Banda no encontrada</h1>
        <Link href="/bands" className="mt-4 inline-block text-violet-400 hover:text-violet-300">
          Volver a mis bandas
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-8 lg:px-12">
      {/* Back link */}
      <Link
        href={`/bands/${band.slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a {band.name}
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight text-white">Configuración</h1>
      <p className="mt-1 text-sm text-zinc-500">Administra la configuración de tu banda</p>

      {/* General settings */}
      <section className="mt-8">
        <h2 className="text-lg font-medium text-white">General</h2>
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-400">Logo de la banda</label>
              <LogoUpload
                currentLogoUrl={logoUrl}
                bandId={band.id}
                onUpload={url => setLogoUrl(url)}
                onRemove={() => setLogoUrl(null)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-zinc-400">
                Nombre de la banda
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="genre" className="block text-sm font-medium text-zinc-400">
                Género
              </label>
              <select
                id="genre"
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="">Sin género</option>
                {GENRES.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-zinc-400">
                Descripción
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="block w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={saving} className="bg-violet-600 hover:bg-violet-500">
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar cambios
            </Button>

            {saveMessage && (
              <p
                className={`text-sm ${
                  saveMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {saveMessage.text}
              </p>
            )}
          </div>
        </form>
      </section>

      {/* Google Drive Integration */}
      <section id="drive" className="mt-10">
        <h2 className="text-lg font-medium text-white">Almacenamiento de Clips</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Conecta Google Drive para guardar automáticamente los clips generados
        </p>
        <div className="mt-4">
          <DriveConnect band={band} onUpdate={setBand} />
        </div>
      </section>

      {/* Invitations */}
      <section id="invitations" className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Códigos de invitación</h2>
          <Button
            size="sm"
            onClick={handleCreateInvitation}
            disabled={creatingInvite}
            className="bg-violet-600 hover:bg-violet-500"
          >
            {creatingInvite ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Crear código
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {invitations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center">
              <p className="text-sm text-zinc-500">No hay códigos de invitación activos</p>
            </div>
          ) : (
            invitations.map(invitation => (
              <div
                key={invitation.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <code className="rounded bg-zinc-800 px-3 py-1.5 font-mono text-sm text-white">
                    {invitation.code}
                  </code>
                  <button
                    onClick={() => copyCode(invitation.code)}
                    className="text-zinc-500 transition-colors hover:text-white"
                  >
                    {copiedCode === invitation.code ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-500">
                    Usos: {invitation.uses}
                    {invitation.max_uses && `/${invitation.max_uses}`}
                  </span>
                  <button
                    onClick={() => handleDeactivateInvitation(invitation.id)}
                    className="text-zinc-500 transition-colors hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Danger zone */}
      <section className="mt-10">
        <h2 className="text-lg font-medium text-red-400">Zona de peligro</h2>
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <h3 className="font-medium text-white">Eliminar banda</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Esta acción eliminará permanentemente la banda y todo su contenido.
          </p>

          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-4 border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar banda
            </Button>
          ) : (
            <div className="mt-4 flex items-center gap-3">
              <Button
                onClick={handleDeleteBand}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-500"
              >
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <AlertTriangle className="mr-2 h-4 w-4" />
                )}
                Confirmar eliminación
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="border-zinc-700 bg-transparent"
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
