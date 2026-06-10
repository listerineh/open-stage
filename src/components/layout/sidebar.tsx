'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Video,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Music,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { useBandContext } from '@/contexts/band-context';

interface SidebarProps {
  user: {
    email: string;
    fullName: string;
    avatarUrl?: string;
    initials: string;
  };
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Generador de Clips',
    href: '/tools/clip-generator',
    icon: Video,
  },
  {
    label: 'Mis Clips',
    href: '/clips',
    icon: FolderOpen,
    disabled: true,
    badge: 'Pronto',
  },
];

const BOTTOM_ITEMS = [
  {
    label: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar({ user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBandMenuOpen, setIsBandMenuOpen] = useState(false);
  const pathname = usePathname();
  const { bands, currentBand, switchBand } = useBandContext();

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
        <Link href="/dashboard" onClick={() => setIsOpen(false)}>
          <Logo size="sm" />
        </Link>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Band Selector */}
      {bands.length > 0 && (
        <div className="border-b border-zinc-800 p-4">
          <button
            onClick={() => setIsBandMenuOpen(!isBandMenuOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 transition-colors hover:bg-zinc-800"
          >
            <div className="flex items-center gap-2.5">
              {currentBand?.logo_url ? (
                <Image
                  src={currentBand.logo_url}
                  alt={currentBand.name}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded object-cover"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded bg-violet-500/20">
                  <Music className="h-3.5 w-3.5 text-violet-400" />
                </div>
              )}
              <span className="text-sm font-medium text-white">
                {currentBand?.name || 'Seleccionar banda'}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-zinc-500 transition-transform',
                isBandMenuOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Band dropdown */}
          {isBandMenuOpen && (
            <div className="mt-2 space-y-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
              {bands.map(band => (
                <button
                  key={band.id}
                  onClick={() => {
                    switchBand(band.id);
                    setIsBandMenuOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                    currentBand?.id === band.id
                      ? 'bg-violet-500/10 text-violet-400'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  )}
                >
                  {band.logo_url ? (
                    <Image
                      src={band.logo_url}
                      alt={band.name}
                      width={20}
                      height={20}
                      className="h-5 w-5 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-700">
                      <Music className="h-3 w-3 text-zinc-400" />
                    </div>
                  )}
                  {band.name}
                </button>
              ))}
              <div className="my-1 border-t border-zinc-800" />
              <Link
                href="/bands"
                onClick={() => {
                  setIsBandMenuOpen(false);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                Gestionar bandas
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.disabled) {
            return (
              <div
                key={item.href}
                className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-zinc-600"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-violet-500/10 text-violet-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-zinc-800 p-4">
        {/* Settings */}
        {BOTTOM_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-violet-500/10 text-violet-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}

        {/* User */}
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.fullName}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-sm font-medium text-violet-400">
              {user.initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          </div>
        </div>

        {/* Logout */}
        <form action="/auth/signout" method="post" className="mt-2">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 backdrop-blur-sm transition-colors hover:bg-zinc-800 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5 text-zinc-400" />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop spacer */}
      <div className="hidden w-64 shrink-0 lg:block" />
    </>
  );
}
