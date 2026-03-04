'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Health', href: '/carve' },
  { label: 'Money', href: '/carve/money' },
  { label: 'Wiki', href: '/' },
] as const;

interface MarketingHeaderProps {
  isAuthenticated?: boolean;
}

export function MarketingHeader({ isAuthenticated = false }: MarketingHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    const stripped = pathname?.replace(/^\/(nl|en|de|fr|es)/, '') || '';
    if (href === '/') return stripped === '/' || stripped === '';
    return stripped.startsWith(href);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/carve"
              className="text-white font-bold text-lg tracking-[0.2em] hover:text-white/80 transition-colors"
            >
              CARVE
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-white'
                      : 'text-white/40 hover:text-white/70'
                  }`}
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

            {/* Right side */}
            <div className="hidden md:flex items-center">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-white/40 hover:text-white/70 transition-colors px-4 py-2"
                >
                  Dashboard
                </Link>
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
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-2xl font-medium py-3 transition-colors ${
                    isActive(item.href) ? 'text-white' : 'text-white/30'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-white/[0.08] mt-4 pt-4">
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
