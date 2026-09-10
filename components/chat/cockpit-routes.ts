import type { AppMode } from './types'

/**
 * De vertaling tussen pad en modus, op één plek.
 *
 * @ai-why: De cockpit had zijn modus in React-state. Dat betekende geen bladwijzers, een
 * terugknop die niets deed, en een verversing die je altijd op Carve zette. Sinds de
 * routes is het pad de bron van waarheid; deze tabel is de enige plek waar de twee bij
 * elkaar komen.
 *
 * @ai-gotcha: Voeg je een modus toe, dan hoort hij hier én in `modes` in ChatSidebar én
 * als route onder `app/(cockpit)/`. Vergeet je de route, dan wijst de zijbalk naar een
 * 404; vergeet je deze tabel, dan blijft de knop na navigatie ongemarkeerd staan.
 *
 * @ai-sync: components/chat/ChatSidebar.tsx
 * @ai-sync: app/(cockpit)/
 */
export const MODE_PATHS: Record<AppMode, string> = {
  carve: '/',
  wiki: '/wiki',
  hiscores: '/hiscores',
  brein: '/jij',
  admin: '/beheer',
}

export function pathForMode(mode: AppMode): string {
  return MODE_PATHS[mode]
}

export function modeFromPath(pathname: string): AppMode {
  if (pathname === '/' || pathname === '') return 'carve'
  if (pathname.startsWith('/beheer')) return 'admin'
  if (pathname.startsWith('/wiki')) return 'wiki'
  if (pathname.startsWith('/hiscores')) return 'hiscores'
  if (pathname.startsWith('/jij')) return 'brein'
  return 'carve'
}

/** De secties binnen Beheer, in de volgorde van de zijbalk. */
export const ADMIN_SECTIONS = [
  { id: 'overview', label: 'Overzicht', path: '/beheer' },
  { id: 'users', label: 'Gebruikers', path: '/beheer/gebruikers' },
  { id: 'content', label: 'Inhoud', path: '/beheer/inhoud' },
  { id: 'feedback', label: 'Feedback', path: '/beheer/feedback' },
  { id: 'money', label: 'Geld', path: '/beheer/geld' },
  { id: 'ads', label: 'Ads', path: '/beheer/ads' },
] as const

/**
 * @ai-gotcha: Van lang naar kort vergelijken. `/beheer` is een prefix van elk ander
 * beheerpad, dus een simpele `startsWith` in lijstvolgorde zou altijd Overzicht
 * teruggeven en de andere vijf nooit markeren.
 */
export function adminSectionFromPath(pathname: string): string {
  const gevonden = [...ADMIN_SECTIONS]
    .sort((a, b) => b.path.length - a.path.length)
    .find((s) => pathname === s.path || pathname.startsWith(s.path + '/'))

  return gevonden?.id ?? 'overview'
}
