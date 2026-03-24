'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Import navigation configs
import { wikiNavigationGroups } from '@/lib/navigation/wiki-navigation';
import { loginNavigationGroups } from '@/lib/navigation/dashboard-navigation';
import { adminNavigationGroups } from '@/lib/navigation/admin-navigation';
import { hiscoresNavigationGroups } from '@/lib/navigation/hiscores-navigation';
import { carveNavigationGroups } from '@/lib/navigation/carve-navigation';
import { supportNavigationGroups } from '@/lib/navigation/support-navigation';
import { unifiedNavigationGroups } from '@/lib/navigation/unified-navigation';

// Import icons
import { iconMap } from '@/components/icons/sidebar-icons';

type NavigationItem = {
  title: string;
  href: string;
  icon: { name: string };
  description: string;
};

type NavigationGroup = {
  label: string;
  icon: { name: string };
  items: NavigationItem[];
};

type SectionTheme = {
  accent: string;       // Active text/icon color
  accentBg: string;     // Active background
};

const sectionThemes: Record<string, SectionTheme> = {
  inbox:   { accent: '#f59e0b', accentBg: 'rgba(245,158,11,0.08)' },
  health:  { accent: '#22c55e', accentBg: 'rgba(34,197,94,0.08)' },
  money:   { accent: '#3b82f6', accentBg: 'rgba(59,130,246,0.08)' },
  life:    { accent: '#a855f7', accentBg: 'rgba(168,85,247,0.08)' },
  admin:   { accent: '#f59e0b', accentBg: 'rgba(245,158,11,0.10)' },
  default: { accent: '#e2e8f0', accentBg: 'rgba(226,232,240,0.08)' },
};

function getSectionKey(pathname: string): string {
  if (pathname.startsWith('/inbox')) return 'inbox';
  if (pathname.startsWith('/money')) return 'money';
  if (pathname.startsWith('/travel')) return 'life';
  if (pathname.startsWith('/workouts') || pathname.startsWith('/food')) return 'health';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'default';
}

function getSidebarGroups(pathname: string, isAuthenticated: boolean, userRole?: string): NavigationGroup[] | null {
  const path = pathname;

  if (path === '/' || path.startsWith('/wiki')) {
    return wikiNavigationGroups as NavigationGroup[];
  }
  if (path.startsWith('/admin')) {
    if (userRole !== 'admin') return null;
    return adminNavigationGroups as NavigationGroup[];
  }
  if (path.startsWith('/chat') || path.startsWith('/money') || path.startsWith('/travel') || path.startsWith('/workouts') || path.startsWith('/food') || path.startsWith('/social') || path.startsWith('/profile') || path.startsWith('/settings') || path.startsWith('/health') || path.startsWith('/inbox')) {
    return isAuthenticated
      ? (unifiedNavigationGroups as NavigationGroup[])
      : (loginNavigationGroups as NavigationGroup[]);
  }
  if (path.startsWith('/hiscores')) {
    return hiscoresNavigationGroups as NavigationGroup[];
  }
  if (path.startsWith('/carve')) {
    return carveNavigationGroups as NavigationGroup[];
  }
  if (path.startsWith('/support')) {
    return supportNavigationGroups as NavigationGroup[];
  }
  if (path.startsWith('/login') || path.startsWith('/signup')) {
    return wikiNavigationGroups as NavigationGroup[];
  }

  return wikiNavigationGroups as NavigationGroup[];
}

export function AppSidebarController({
  userRole,
  isAuthenticated = false,
}: {
  userRole?: string;
  isAuthenticated?: boolean;
}) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const activeItemRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groups = getSidebarGroups(pathname, isAuthenticated, userRole);
  const safeGroups = groups || [];
  const sectionKey = getSectionKey(pathname);
  const theme = sectionThemes[sectionKey] || sectionThemes.default;

  // Find the most specific matching href across all nav items
  const allHrefs = safeGroups.flatMap((g) => g.items.map((i) => i.href));
  const activeHref = allHrefs
    .filter((href) => pathname === href || (href !== '/' && pathname.startsWith(href + '/')))
    .sort((a, b) => b.length - a.length)[0] ?? null;

  useEffect(() => {
    if (activeItemRef.current && navRef.current) {
      const navElement = navRef.current;
      const activeElement = activeItemRef.current;

      const relativeTop = activeElement.offsetTop;
      const navHeight = navElement.clientHeight;
      const activeHeight = activeElement.clientHeight;
      const scrollTop = relativeTop - navHeight / 2 + activeHeight / 2;

      navElement.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth',
      });
    }
  }, [pathname]);

  return (
    <div
      className={cn(
        "hidden lg:flex lg:flex-col h-full max-h-full shrink-0 transition-[width] duration-300 ease-in-out pb-3",
        'bg-surface'
      )}
      style={{
        width: isHovered ? '200px' : '64px',
        zIndex: 45,
        willChange: 'width',
      }}
      onMouseEnter={() => {
        if (leaveTimer.current) clearTimeout(leaveTimer.current);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        leaveTimer.current = setTimeout(() => setIsHovered(false), 100);
      }}
      role="navigation"
      aria-label="Hoofdnavigatie"
    >
      <nav ref={navRef} className="flex-1 px-2 overflow-y-auto scrollbar-thin-auto-hide">
          {safeGroups.map((group) => (
            <div key={`desktop-${group.label}`} className="mb-2">
              {/* Group divider with label */}
              <div className="flex items-center gap-2 px-3 mb-1 min-h-[24px]">
                <div
                  className="w-4 h-0.5 rounded shrink-0 bg-white/[0.08]"
                />
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider overflow-hidden whitespace-nowrap transition-opacity duration-300',
                    'text-ink-tertiary',
                    isHovered ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{
                    display: 'inline-block',
                    width: isHovered ? 'auto' : 0,
                    minWidth: 0,
                  }}
                >
                  {group.label}
                </span>
              </div>

              {/* Group items */}
              {group.items.map((item, itemIndex) => {
                const isActive = activeHref === item.href;

                const iconName = item.icon?.name || 'HomeIcon';
                const Icon = iconMap[iconName] || iconMap['HomeIcon'];
                const uniqueKey = `desktop-${group.label}-${item.href}-${itemIndex}`;

                return (
                  <div key={uniqueKey} className="mb-0.5">
                    <Link
                      ref={isActive ? activeItemRef : null}
                      href={item.href}
                      className={cn(
                        'group h-7 flex items-center rounded-lg px-3 py-1 text-sm font-medium relative',
                        isActive
                          ? 'font-medium'
                          : 'text-ink-secondary hover:bg-white/[0.04] hover:text-ink-muted'
                      )}
                      style={isActive ? {
                        color: theme.accent,
                        backgroundColor: theme.accentBg,
                      } : undefined}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          !isActive && 'text-ink-secondary group-hover:text-ink-muted'
                        )}
                        style={isActive ? { color: theme.accent } : undefined}
                      />
                      <span
                        className={cn(
                          'flex-1 ml-3 min-w-0 text-sm font-medium truncate overflow-hidden whitespace-nowrap transition-opacity duration-300',
                          isHovered ? 'opacity-100' : 'opacity-0'
                        )}
                        style={{
                          display: 'inline-block',
                          width: isHovered ? 'auto' : 0,
                          minWidth: 0,
                        }}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
    </div>
  );
}
