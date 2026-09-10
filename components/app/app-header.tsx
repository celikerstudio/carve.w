"use client";

import { LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { SHOW_MONEY, SHOW_LIFE } from '@/lib/flags';

interface AppHeaderProps {
  className?: string;
  isAuthenticated?: boolean;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
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

// @ai-why: Health wijst naar /app en niet naar /carve. Die tweede stuurt in
// next.config.ts (308) door naar precies dezelfde pagina, dus dat was een extra sprong
// in de hoofdnavigatie zonder dat iemand er iets aan had.
// @ai-why: Money en Life staan achter hun vlag en zijn daarmee in productie weg uit deze
// balk. Ze wezen naar /carve/money en /carve/travel, en die geven allebei een 404 zodra
// de vlag uit staat — dit waren twee staande 404's in de hoofdnavigatie van elke
// marketingpagina. Filteren bij de definitie en niet bij de lezer, net als
// `unifiedNavigationGroups` deed, zodat de volgende lezer de gate niet vergeet.
// @ai-why: wijst naar /carve/travel en niet /carve/life — die route bestaat niet en dit
// was een staande 404 in de hoofdnavigatie (gevonden bij TDR-0001).
// @ai-sync: lib/flags.ts (SHOW_MONEY, SHOW_LIFE)
// @ai-sync: next.config.ts (/carve -> /app)
const MARKETING_NAV = [
  { label: 'Health', href: '/app' },
  ...(SHOW_MONEY ? [{ label: 'Money', href: '/carve/money' }] : []),
  ...(SHOW_LIFE ? [{ label: 'Life', href: '/carve/travel' }] : []),
];

export function AppHeader({
  className,
  isAuthenticated = false,
  userEmail,
  userName,
  userAvatar,
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
  // @ai-why: Geen balk bij één item. Zonder Money en Life houdt de navigatie alleen
  // Health over, en dat is dezelfde bestemming als het CARVE-logo ernaast: twee keer
  // hetzelfde aanbieden leest als een halve navigatie in plaats van geen.
  const navItems = isMarketing && MARKETING_NAV.length > 1 ? MARKETING_NAV : null;

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
            {/* @ai-why: /app en niet /carve. Die tweede is sinds TDR-0007 een permanente
                redirect naar deze pagina; het logo van elke pagina liet je dus een extra
                sprong maken.
                @ai-sync: next.config.ts (/carve -> /app) */}
            <Link
              href="/app"
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
            {/* @ai-why: Hier stonden tot 2026-09-10 een wiki-zoekbalk en een boek-knop.
                De wiki woont sinds die dag in de cockpit onder `app/(cockpit)/wiki/` en
                dus achter de login, terwijl deze header alleen op de publieke
                /carve-pagina's staat. Elke bezoeker die erop klikte werd naar /app
                gestuurd; daarvoor gaf hij een 404 zolang `SHOW_WIKI` uit stond.
                @ai-sync: app/(cockpit)/wiki/page.tsx
                @ai-sync: components/app/layout-wrapper.tsx (welke routes deze header dragen) */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
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

                        {/* @ai-why: Hier stonden tot 2026-09-10 ook Profile, Settings en
                            (voor admins) Admin. Die drie routes zijn met TDR-0010
                            verwijderd en gaven een 404 vanuit het gebruikersmenu van elke
                            publieke pagina. Wat ze deden zit nu in de cockpit hieronder,
                            als modus: profiel en instellingen bij Brein, beheer in de
                            Admin-modus uit TDR-0006.
                            @ai-sync: components/chat/ChatSidebar.tsx (de modi in de cockpit)
                            @ai-sync: docs/tdr/0010-het-web-platform-gaat-weg.md */}
                        <div className="py-1">
                          <Link
                            href="/"
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
                        </div>

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
                {isAuthenticated ? (
                  <Link
                    href="/"
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
