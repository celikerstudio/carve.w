"use client";

import { Settings, User, LogOut, Menu, X, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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

// Nav items: marketing pages link to /carve/*
const MARKETING_NAV = [
  { label: 'Health', href: '/carve' },
  { label: 'Money', href: '/carve/money' },
  { label: 'Life', href: '/carve/life' },
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const path = stripLocale(pathname);
  const isWikiRoute = path === '/' || path.startsWith('/wiki');
  const isMarketing = path === '/carve' || path.startsWith('/carve/');
  const isDashboard = path.startsWith('/chat') || path.startsWith('/money') || path.startsWith('/travel') || path.startsWith('/workouts') || path.startsWith('/food') || path.startsWith('/social') || path.startsWith('/profile') || path.startsWith('/settings') || path.startsWith('/health') || path.startsWith('/inbox');
  // Only show nav tabs on marketing pages — dashboard uses the sidebar
  const navItems = isMarketing ? MARKETING_NAV : null;

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
    if (itemPath === '/chat') return path === '/chat';
    return path === itemPath || path.startsWith(itemPath);
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,box-shadow] duration-300',
          !transparent && (isWikiRoute
            ? (scrolled
              ? 'bg-white/70 backdrop-blur-xl border-b border-subtle/60 shadow-sm'
              : 'bg-transparent')
            : isMarketing
              ? (scrolled
                ? 'bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/[0.04]'
                : 'bg-transparent')
              : (scrolled
                ? 'bg-surface/90 backdrop-blur-xl'
                : 'bg-surface')),
          className
        )}
        role="banner"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative flex items-center h-16">
            {/* Logo - left */}
            <Link
              href="/carve"
              className={cn(
                "font-bold text-lg tracking-[0.2em] transition-colors",
                isWikiRoute ? "text-ink hover:text-ink-secondary" : "text-white hover:text-white/80"
              )}
            >
              CARVE
            </Link>

            {/* Desktop nav - absolutely centered (marketing pages only) */}
            {navItems && (
              <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative px-4 py-2 text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? (isWikiRoute ? 'text-ink' : 'text-white')
                        : (isWikiRoute ? 'text-ink-tertiary hover:text-ink-secondary' : 'text-white/40 hover:text-white/70')
                    )}
                  >
                    {item.label}
                    {isActive(item.href) && (
                      <motion.div
                        layoutId="header-indicator"
                        className={cn("absolute bottom-0 left-4 right-4 h-px", isWikiRoute ? "bg-ink/50" : "bg-white/50")}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                      />
                    )}
                  </Link>
                ))}
              </nav>
            )}

            {/* Right side - Desktop */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <SearchBar variant="header" theme={isWikiRoute ? 'light' : 'dark'} />
              <Link
                href="/"
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isWikiRoute
                    ? 'text-ink bg-ink/[0.06]'
                    : (path === '/' || path.startsWith('/wiki')
                      ? 'text-white bg-white/[0.08]'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]')
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
                      <div className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold",
                        isWikiRoute ? "bg-gradient-to-br from-gray-200 to-gray-300 text-ink" : "bg-gradient-to-br from-slate-600 to-slate-800 text-white"
                      )}>
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
                      <div className={cn(
                        "absolute right-0 mt-2 w-56 rounded-xl shadow-2xl py-1 z-50",
                        isWikiRoute ? "bg-white border border-subtle" : "bg-surface-raised border border-white/[0.08]"
                      )}>
                        <div className={cn("px-3 py-2.5 border-b", isWikiRoute ? "border-subtle" : "border-white/[0.06]")}>
                          <p className={cn("text-sm font-medium leading-none", isWikiRoute ? "text-ink" : "text-white")}>
                            {userName || 'User'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 leading-none">
                            {userEmail}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/chat"
                            onClick={() => setIsDropdownOpen(false)}
                            className={cn("flex items-center px-3 py-2 text-sm transition-colors", isWikiRoute ? "text-ink-secondary hover:bg-surface hover:text-ink" : "text-slate-400 hover:bg-white/[0.04] hover:text-white")}
                          >
                            <svg className="mr-2.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="7" height="7" />
                              <rect x="14" y="3" width="7" height="7" />
                              <rect x="3" y="14" width="7" height="7" />
                              <rect x="14" y="14" width="7" height="7" />
                            </svg>
                            Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className={cn("flex items-center px-3 py-2 text-sm transition-colors", isWikiRoute ? "text-ink-secondary hover:bg-surface hover:text-ink" : "text-slate-400 hover:bg-white/[0.04] hover:text-white")}
                          >
                            <User className="mr-2.5 h-4 w-4" />
                            Profile
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setIsDropdownOpen(false)}
                            className={cn("flex items-center px-3 py-2 text-sm transition-colors", isWikiRoute ? "text-ink-secondary hover:bg-surface hover:text-ink" : "text-slate-400 hover:bg-white/[0.04] hover:text-white")}
                          >
                            <Settings className="mr-2.5 h-4 w-4" />
                            Settings
                          </Link>
                        </div>

                        {userRole === 'admin' && (
                          <>
                            <div className={cn("border-t", isWikiRoute ? "border-subtle" : "border-white/[0.06]")} />
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

                        <div className={cn("border-t", isWikiRoute ? "border-subtle" : "border-white/[0.06]")} />
                        <button
                          onClick={handleLogout}
                          className={cn("flex items-center w-full px-3 py-2 text-sm transition-colors", isWikiRoute ? "text-ink-secondary hover:bg-surface hover:text-ink" : "text-slate-400 hover:bg-white/[0.04] hover:text-white")}
                        >
                          <LogOut className="mr-2.5 h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                isMarketing ? (
                  <Link
                    href="/login"
                    className="text-sm font-medium text-white bg-white/10 hover:bg-white/15 transition-colors px-4 py-2 rounded-lg"
                  >
                    Sign in
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className={cn(
                      "text-sm font-medium transition-colors px-4 py-2",
                      isWikiRoute ? "text-ink-tertiary hover:text-ink-secondary" : "text-white/40 hover:text-white/70"
                    )}
                  >
                    Log in
                  </Link>
                )
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "md:hidden transition-colors p-2",
                isWikiRoute ? "text-ink-secondary hover:text-ink" : "text-white/60 hover:text-white"
              )}
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
              {navItems?.map((item) => (
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
                    href="/chat"
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
