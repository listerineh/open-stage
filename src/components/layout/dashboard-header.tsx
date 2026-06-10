'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, ChevronDown, LogOut, User } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { BandSelector } from './band-selector';

interface DashboardHeaderProps {
  user: {
    email: string;
    fullName: string;
    avatarUrl?: string;
    initials: string;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 md:px-8 lg:px-12">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Logo size="sm" />
          </Link>
          <div className="hidden h-6 w-px bg-zinc-800 sm:block" />
          <div className="hidden sm:block">
            <BandSelector />
          </div>
        </div>

        {/* Nav Links */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </nav>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-800/50"
          >
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.fullName}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm font-medium text-white">
                {user.initials}
              </div>
            )}
            <span className="hidden text-sm text-zinc-300 sm:block">{user.fullName}</span>
            <ChevronDown
              className={`h-4 w-4 text-zinc-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown */}
          <div
            className={`absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-xl transition-all ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
          >
            <div className="border-b border-zinc-800 px-3 py-2">
              <p className="text-sm font-medium text-white">{user.fullName}</p>
              <p className="text-xs text-zinc-500">{user.email}</p>
            </div>
            <div className="mt-2 space-y-1">
              {/* Mobile band selector */}
              <div className="block sm:hidden">
                <BandSelector />
              </div>
              <Link
                href="/settings"
                onClick={() => setIsMenuOpen(false)}
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
  );
}
