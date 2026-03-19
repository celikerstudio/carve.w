'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AppShell, AppBody, AppContent } from "@/components/app/app-shell"
import { AppHeader } from "@/components/app/app-header"
import { AppSidebarController } from "@/components/app/app-sidebar-controller"

interface LayoutWrapperProps {
  children: React.ReactNode
  isAuthenticated: boolean
  userEmail?: string
  userName?: string
  userAvatar?: string
  userRole?: string
}

const LOCALES = ['en', 'nl', 'de', 'fr', 'es'];
function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && LOCALES.includes(segments[0])) {
    return '/' + segments.slice(1).join('/') || '/';
  }
  return pathname;
}

export function LayoutWrapper({
  children,
  isAuthenticated,
  userEmail,
  userName,
  userAvatar,
  userRole,
}: LayoutWrapperProps) {
  const pathname = usePathname()
  const path = stripLocale(pathname || '')

  // Auth routes (login, signup) get no app chrome
  const isAuthRoute = pathname?.includes('/login') || pathname?.includes('/signup') || pathname?.includes('/forgot-password')

  // Lab has its own shell — bypass all app chrome
  const isLabRoute = path.startsWith('/lab')

  // Chat route — full viewport, only header, no sidebar
  // Note: usePathname() returns URL path, not file-system path.
  // Route groups like (protected) are invisible in URLs, so /chat is correct.
  const isChatRoute = path.startsWith('/chat')

  if (isChatRoute) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0b]">
        {children}
      </div>
    )
  }

  // Marketing pages render with their own header (no sidebar)
  const isMarketingRoute =
    path === '/carve' ||
    path === '/carve/health' ||
    path === '/carve/money' ||
    path === '/carve/roadmap' ||
    path === '/carve/vision' ||
    path === '/carve/faq' ||
    path === '/carve/travel' ||
    path === '/carve/developer' ||
    path === '/carve/contributing'

  // Wiki pages render with header but no sidebar — full-width scrollable
  const isWikiRoute = path === '/' || path.startsWith('/wiki')

  if (isAuthRoute || isLabRoute) {
    return <>{children}</>
  }

  if (isMarketingRoute) {
    return (
      <div className="min-h-screen bg-[#0A0A0B]">
        <div className="fixed top-0 left-0 right-0 z-50">
          <AppHeader
            isAuthenticated={isAuthenticated}
            userEmail={userEmail}
            userName={userName}
            userAvatar={userAvatar}
            userRole={userRole}
          />
        </div>
        <div className="pt-16">
          {children}
        </div>
      </div>
    )
  }

  if (isWikiRoute) {
    return (
      <div className="min-h-screen bg-surface">
        {/* Fixed header */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <AppHeader
            isAuthenticated={isAuthenticated}
            userEmail={userEmail}
            userName={userName}
            userAvatar={userAvatar}
            userRole={userRole}
          />
        </div>

        {/* Full-width scrollable content — no sidebar, no fixed shell */}
        <div className="pt-16">
          {children}
        </div>
      </div>
    )
  }

  // Dashboard and other routes use sidebar shell
  return (
    <div className="min-h-screen bg-surface">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AppHeader
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
          userName={userName}
          userAvatar={userAvatar}
          userRole={userRole}
        />
      </div>

      {/* Shell wrapper — edge-to-edge, no margins */}
      <div className="fixed top-16 left-0 right-0 bottom-0">
        <AppShell hasGlobalHeader headerHeight={64} disablePageScroll={true} isDark>
          <AppBody>
            <AppSidebarController
              isAuthenticated={isAuthenticated}
              userRole={userRole}
            />
            <AppContent padded={false} useFixedHeight={true} isDark>
              {children}
            </AppContent>
          </AppBody>
        </AppShell>
      </div>
    </div>
  )
}
