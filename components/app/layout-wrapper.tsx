'use client'

import { usePathname } from 'next/navigation'
import { AppHeader } from "@/components/app/app-header"

interface LayoutWrapperProps {
  children: React.ReactNode
  isAuthenticated: boolean
  userEmail?: string
  userName?: string
  userAvatar?: string
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
}: LayoutWrapperProps) {
  const pathname = usePathname()
  const path = stripLocale(pathname || '')

  // @ai-why: `/reset-password` hoort in deze lijst en stond er tot 2026-09-10 niet in.
  // Hij viel daardoor in de laatste tak, en dat was de zijbalk-shell: wie op een
  // wachtwoord-link uit zijn mail klikte kreeg een wiki-navigatie om het formulier heen.
  // De vier auth-schermen dragen hun eigen volledige venster.
  // @ai-sync: app/(auth)/reset-password/page.tsx
  const isAuthRoute =
    path.startsWith('/login') ||
    path.startsWith('/signup') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password')

  // @ai-why: /app is sinds TDR-0007 de marketingpagina en draagt zijn eigen dunne balk
  // (MarketingHeader), dus geen AppHeader erboven. / en /carve sturen in next.config.ts
  // door naar /app en komen hier niet meer langs.
  // @ai-sync: components/carve/MarketingHeader.tsx
  // @ai-sync: next.config.ts (redirects)
  const isLandingRoute = path === '/app'

  if (isLandingRoute) {
    return (
      <div className="min-h-screen bg-[#0A0A0B]">
        {children}
      </div>
    )
  }

  // Marketing pages render with their own header (no sidebar)
  const isMarketingRoute =
    path === '/carve/health' ||
    path === '/carve/money' ||
    path === '/carve/roadmap' ||
    path === '/carve/vision' ||
    path === '/carve/faq' ||
    path === '/carve/travel' ||
    path === '/carve/developer' ||
    path === '/carve/contributing'

  // @ai-why: Privacy, terms en support zijn de drie pagina's die Apple eist en de
  // enige die naast de marketingpagina publiek zijn (TDR-0005). Ze dragen hun eigen
  // kop en voet (LegalPage) en horen niet onder de AppHeader.
  // @ai-sync: components/carve/LegalPage.tsx
  const isPlainRoute = path === '/privacy' || path === '/terms' || path === '/support'

  if (isAuthRoute || isPlainRoute) {
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
          />
        </div>
        <div className="pt-16">
          {children}
        </div>
      </div>
    )
  }

  // @ai-why: Alles zonder eigen tak draagt hier géén chrome. Dat zijn twee soorten
  // pagina's: de 404, en elke route onder `app/(cockpit)/`. Die tweede draagt zijn
  // volledige venster in zijn eigen layout, en dat is bewust — dit bestand kende tot
  // 2026-09-10 alleen `/` als cockpit-adres, dus toen de modi eigen routes kregen
  // (/wiki, /hiscores, /jij, /beheer) viel de rest ernaast: geen hoogte voor de zijbalk,
  // een andere achtergrond eronder, en op /wiki kwam er een marketingheader bij.
  //
  // @ai-why: Hier stond tot diezelfde dag een zijbalk-shell als terugval. Die toonde de
  // wiki-navigatie van vóór TDR-0010, terwijl die routes niet meer bestonden: elke link
  // gaf dezelfde 404 waar je al stond.
  //
  // @ai-gotcha: Een nieuwe route krijgt hierdoor standaard geen chrome. Dat is de goede
  // kant op fout (kaal in plaats van half goed), maar het betekent wel dat een pagina
  // die de AppHeader hoort te dragen hierboven expliciet in de lijst moet.
  //
  // @ai-sync: app/not-found.tsx (draagt daarom zijn eigen achtergrond en knop)
  // @ai-sync: app/(cockpit)/layout.tsx (draagt het venster voor de hele groep)
  // @ai-sync: docs/tdr/0010-het-web-platform-gaat-weg.md
  return <>{children}</>
}
