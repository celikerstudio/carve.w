"use client";

import { Settings, User, LogOut, Menu, X, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { SearchBar } from '@/components/wiki/SearchBar';

interface AppHeaderProps {
  className?: string;
  isAuthenticated?: boolean;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
  userRole?: string;
  transparent?: boolean;
}

const LOCALES = ['en', 'nl', 'de', 'fr', 'es'];
function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && LOCALES.includes(segments[0])) {
    return '/' + segments.slice(1).join('/') || '/';
  }
  return pathname;
}

// Nav items: marketing pages link to /carve/*, app pages link to /dashboard/*
const APP_NAV = [
  { label: 'Health', href: '/dashboard' },
  { label: 'Money', href: '/dashboard/money' },
  { label: 'Travel', href: '/dashboard/travel' },
] as const;

const MARKETING_NAV = [
  { label: 'Health', href: '/carve/health' },
  { label: 'Money', href: '/carve/money' },
  { label: 'Travel', href: '/carve/travel' },
] as const;

export function AppHeader({
  className,
  isAuthenticated = false,
  userEmail,
  userName,
  userAvatar,
  userRole,
  transparent = false,
}: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const path = stripLocale(pathname);
  const isMarketing = path === '/carve' || path.startsWith('/carve/');
  const navItems = isMarketing ? MARKETING_NAV : APP_NAV;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
    setIsDropdownOpen(false);
  };

  const getInitials = () => {
    if (userName) return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (userEmail) return userEmail.slice(0, 2).toUpperCase();
    return 'U';
  };

  const isActive = (href: string) => {
    const itemPath = stripLocale(href);
    if (itemPath === '/') return path === '/' || path.startsWith('/wiki');
    if (itemPath === '/dashboard') return path === '/dashboard' || (path.startsWith('/dashboard') && !path.startsWith('/dashboard/money') && !path.startsWith('/dashboard/travel'));
    return path === itemPath || path.startsWith(itemPath);
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          !transparent && 'bg-[#0c0e14]',
          className
        )}
        role="banner"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative flex items-center h-16">
            {/* Logo - left */}
            <Link
              href="/carve"
              className="text-white font-bold text-lg tracking-[0.2em] hover:text-white/80 transition-colors"
            >
              CARVE
            </Link>

            {/* Desktop nav - absolutely centered */}
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'text-white'
                      : 'text-white/40 hover:text-white/70'
                  )}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="header-indicator"
                      className="absolute bottom-0 left-4 right-4 h-px bg-white/50"
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right side - Desktop */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <SearchBar variant="header" />
              <Link
                href="/"
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  path === '/' || path.startsWith('/wiki')
                    ? 'text-white bg-white/[0.08]'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                )}
                title="Wiki"
              >
                <BookOpen className="w-4 h-4" />
              </Link>
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 transition-colors"
                  >
                    {userAvatar && (userAvatar.startsWith('/') || userAvatar.startsWith('http')) ? (
                      <Image
                        src={userAvatar}
                        alt={userName || 'User'}
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-[10px] font-semibold text-white">
                        {getInitials()}
                      </div>
                    )}
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl py-1 z-50 bg-[#1a1d25] border border-white/[0.08]">
                        <div className="px-3 py-2.5 border-b border-white/[0.06]">
                          <p className="text-sm font-medium text-white leading-none">
                            {userName || 'User'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 leading-none">
                            {userEmail}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-3 py-2 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-white transition-colors"
                          >
                            <User className="mr-2.5 h-4 w-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-3 py-2 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-white transition-colors"
                          >
                            <Settings className="mr-2.5 h-4 w-4" />
                            Settings
                          </Link>
                        </div>

                        {userRole === 'admin' && (
                          <>
                            <div className="border-t border-white/[0.06]" />
                            <Link
                              href="/admin"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center px-3 py-2 text-sm text-purple-400 hover:bg-purple-500/10 transition-colors"
                            >
                              <svg className="mr-2.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              Admin
                            </Link>
                          </>
                        )}

                        <div className="border-t border-white/[0.06]" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-3 py-2 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-white transition-colors"
                        >
                          <LogOut className="mr-2.5 h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium text-white/40 hover:text-white/70 transition-colors px-4 py-2"
                >
                  Log in
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-white/60 hover:text-white transition-colors p-2"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-20 px-6"
          >
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'text-2xl font-medium py-3 transition-colors',
                    isActive(item.href) ? 'text-white' : 'text-white/30'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-white/[0.08] mt-4 pt-4 flex flex-col gap-2">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'text-lg transition-colors',
                    path === '/' || path.startsWith('/wiki') ? 'text-white' : 'text-white/30'
                  )}
                >
                  Wiki
                </Link>
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="text-lg text-white/40"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-lg text-white/40"
                  >
                    Log in
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
