'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, Calendar, Shield, LogOut, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  provider?: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setProfile({
          id: user.id,
          email: user.email || '',
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          createdAt: user.created_at,
          provider: user.app_metadata?.provider,
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-zinc-500">No se pudo cargar el perfil</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getProviderName = (provider?: string) => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      case 'email':
        return 'Email';
      default:
        return 'Email';
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pt-16 sm:px-6 sm:py-10 md:px-8 lg:px-12 lg:pt-10">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al dashboard
      </Link>

      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Mi cuenta</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gestiona tu información personal y preferencias
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center gap-4">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.fullName}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10 text-2xl font-semibold text-violet-400">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-medium text-white">{profile.fullName}</h2>
              <p className="text-sm text-zinc-500">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h3 className="font-medium text-white">Información de la cuenta</h3>
          </div>
          <div className="divide-y divide-zinc-800">
            <div className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                <Mail className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-500">Email</p>
                <p className="text-sm font-medium text-white">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                <Shield className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-500">Método de autenticación</p>
                <p className="text-sm font-medium text-white">
                  {getProviderName(profile.provider)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                <Calendar className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-500">Miembro desde</p>
                <p className="text-sm font-medium text-white">{formatDate(profile.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5">
          <div className="border-b border-red-500/20 px-6 py-4">
            <h3 className="font-medium text-red-400">Zona de peligro</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">Cerrar sesión</p>
                <p className="text-sm text-zinc-500">Salir de tu cuenta en este dispositivo</p>
              </div>
              <form action="/auth/signout" method="post">
                <Button
                  type="submit"
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
