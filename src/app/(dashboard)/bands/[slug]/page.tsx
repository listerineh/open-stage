'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Music,
  Settings,
  Users,
  Crown,
  Edit,
  Eye,
  Copy,
  Check,
  Loader2,
  Calendar,
  MoreVertical,
  UserMinus,
  LogOut,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Band, BandMember, BandRole, Profile } from '@/types/database';

interface MemberWithProfile extends BandMember {
  profiles: Pick<Profile, 'id' | 'full_name' | 'email' | 'avatar_url'>;
}

const ROLE_CONFIG: Record<BandRole, { label: string; icon: typeof Crown; color: string }> = {
  admin: { label: 'Admin', icon: Crown, color: 'text-amber-400' },
  editor: { label: 'Editor', icon: Edit, color: 'text-blue-400' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-zinc-400' },
};

export default function BandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const supabase = createClient();

  const [band, setBand] = useState<Band | null>(null);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [userRole, setUserRole] = useState<BandRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchBandData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      setCurrentUserId(user.id);

      // Fetch band
      const { data: bandData, error: bandError } = await supabase
        .from('bands')
        .select('*')
        .eq('slug', slug)
        .single();

      if (bandError) {
        console.error('Error fetching band:', bandError);
        setLoading(false);
        return;
      }

      if (!bandData) {
        setLoading(false);
        return;
      }

      setBand(bandData);

      // Fetch members with profiles
      const { data: membersData } = await supabase
        .from('band_members')
        .select('*, profiles(id, full_name, email, avatar_url)')
        .eq('band_id', bandData.id)
        .order('joined_at', { ascending: true });

      setMembers((membersData as MemberWithProfile[]) || []);

      // Get current user's role
      const currentMember = membersData?.find(m => m.user_id === user.id);
      setUserRole(currentMember?.role || null);

      setLoading(false);
    };

    fetchBandData();
  }, [slug, supabase]);

  const copySlug = () => {
    navigator.clipboard.writeText(band?.slug || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChangeRole = async (memberId: string, newRole: BandRole) => {
    if (!band) return;
    setActionLoading(memberId);
    setOpenMenu(null);

    await supabase.from('band_members').update({ role: newRole }).eq('id', memberId);

    setMembers(members.map(m => (m.id === memberId ? { ...m, role: newRole } : m)));
    setActionLoading(null);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!band) return;
    setActionLoading(memberId);
    setOpenMenu(null);

    await supabase.from('band_members').delete().eq('id', memberId);

    setMembers(members.filter(m => m.id !== memberId));
    setActionLoading(null);
  };

  const handleLeaveBand = async () => {
    if (!band || !currentUserId) return;

    const myMembership = members.find(m => m.user_id === currentUserId);
    if (!myMembership) return;

    // Check if user is the only admin
    const adminCount = members.filter(m => m.role === 'admin').length;
    if (myMembership.role === 'admin' && adminCount === 1) {
      alert('No puedes salir siendo el único admin. Asigna otro admin primero.');
      return;
    }

    await supabase.from('band_members').delete().eq('id', myMembership.id);
    router.push('/bands');
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

  const isAdmin = userRole === 'admin';

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-8 lg:px-12">
      {/* Back link */}
      <Link
        href="/bands"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Mis bandas
      </Link>

      {/* Band header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/10">
            {band.logo_url ? (
              <Image
                src={band.logo_url}
                alt={band.name}
                width={80}
                height={80}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <Music className="h-10 w-10 text-violet-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">{band.name}</h1>
            <div className="mt-1 flex items-center gap-3">
              {band.genre && (
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                  {band.genre}
                </span>
              )}
              <button
                onClick={copySlug}
                className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-white"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    {band.slug}
                  </>
                )}
              </button>
            </div>
            {band.description && (
              <p className="mt-3 max-w-lg text-sm text-zinc-400">{band.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {band.drive_folder_id && (
            <Link href={`/bands/${band.slug}/clips`}>
              <Button
                variant="outline"
                className="border-zinc-700 bg-transparent hover:bg-zinc-800"
              >
                <Video className="mr-2 h-4 w-4" />
                Clips
              </Button>
            </Link>
          )}
          {isAdmin && (
            <Link href={`/bands/${band.slug}/settings`}>
              <Button
                variant="outline"
                className="border-zinc-700 bg-transparent hover:bg-zinc-800"
              >
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Members section */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-zinc-500" />
            <h2 className="text-lg font-medium text-white">Miembros</h2>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
              {members.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleLeaveBand}
                className="border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
            )}
            {isAdmin && (
              <Link href={`/bands/${band.slug}/settings#invitations`}>
                <Button size="sm" className="bg-violet-600 hover:bg-violet-500">
                  Invitar
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {members.map(member => {
            const roleConfig = ROLE_CONFIG[member.role];
            const RoleIcon = roleConfig.icon;
            const isCurrentUser = member.user_id === currentUserId;
            const isLoading = actionLoading === member.id;
            const isMenuOpen = openMenu === member.id;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                    {member.profiles.avatar_url ? (
                      <Image
                        src={member.profiles.avatar_url}
                        alt={member.profiles.full_name || ''}
                        width={40}
                        height={40}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-zinc-400">
                        {(member.profiles.full_name || member.profiles.email)?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {member.profiles.full_name || 'Sin nombre'}
                      {isCurrentUser && <span className="ml-2 text-xs text-zinc-500">(tú)</span>}
                    </p>
                    <p className="text-xs text-zinc-500">{member.profiles.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <RoleIcon className={cn('h-4 w-4', roleConfig.color)} />
                    <span className={cn('text-sm', roleConfig.color)}>{roleConfig.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-600">
                    <Calendar className="h-3 w-3" />
                    {new Date(member.joined_at).toLocaleDateString()}
                  </div>

                  {/* Admin actions */}
                  {isAdmin && !isCurrentUser && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(isMenuOpen ? null : member.id)}
                        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-xl">
                          <div className="px-3 py-1.5 text-xs font-medium text-zinc-500">
                            Cambiar rol
                          </div>
                          {(['admin', 'editor', 'viewer'] as BandRole[]).map(role => (
                            <button
                              key={role}
                              onClick={() => handleChangeRole(member.id, role)}
                              className={cn(
                                'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-zinc-800',
                                member.role === role ? 'text-violet-400' : 'text-zinc-300'
                              )}
                            >
                              <ShieldCheck className="h-4 w-4" />
                              {ROLE_CONFIG[role].label}
                              {member.role === role && <Check className="ml-auto h-3 w-3" />}
                            </button>
                          ))}
                          <div className="my-1 border-t border-zinc-800" />
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-zinc-800"
                          >
                            <UserMinus className="h-4 w-4" />
                            Expulsar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
