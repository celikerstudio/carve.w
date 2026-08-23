// @ai-why: Eén bron voor de domeinen van Carve, gelezen door zowel de publieke
// homepage (server-gerenderd) als de AppSwitcher in de chat (client). Vóór
// TDR-0001 stond de lijst als niet-geëxporteerde `const apps` in
// components/chat/AppSwitcher.tsx: een 'use client'-bestand met LucideIcon-
// componenten als veldwaarde, en dus onleesbaar vanaf een server component.
// Daarom is `icon` hier een naam en geen component: pure data, geen React.
// Model: ilvlup/lib/wizard/constants.ts, waar homepage en wizard uit dezelfde
// constante lezen zonder component in het pad.
// Zie docs/tdr/0001-homepage-is-een-keuzescherm.md beslissing 3.

export type DomainId = 'health' | 'money' | 'life'

/** Naam van een lucide-react icoon. Consumers mappen zelf naar het component. */
export type DomainIconName = 'Dumbbell' | 'Wallet' | 'Plane'

export interface Domain {
  id: DomainId
  label: string
  /**
   * @ai-why: De homepage-ondertitel woont hier bewust naast het label. Zet je
   * hem in de pagina, dan kan hij los van het label verlopen, en dat is precies
   * de drift die TDR-0001 opruimt. Zelfde reden als `description` in
   * ilvlup's STRUGGLE_OPTIONS.
   */
  blurb: string
  color: string
  icon: DomainIconName
}

// @ai-sync: components/chat/AppSwitcher.tsx en components/landing/DomainPicker.tsx
// lezen deze lijst. Een domein toevoegen of hernoemen raakt beide oppervlakken.
//
// @ai-context: De labels horen gelijk te blijven aan L10n.DomainTitle.* in de
// iOS-app (Carve AI/Generated/Strings+Generated.swift). Lopen ze uiteen, dan
// heten dezelfde dingen op twee plekken anders.
//
// @ai-todo: Inbox stond hier als vierde domein en is uitgezet omdat het scherm
// niet bestaat; de mail-edge-functions draaien wel maar vullen de andere
// domeinen. Vrienden komt erbij zodra het op web een oppervlak heeft — de drie
// voorwaarden staan in TDR-0001 beslissing 4.
export const DOMAINS: readonly Domain[] = [
  { id: 'health', label: 'Health', blurb: 'Workouts, food, recovery',        color: '#22c55e', icon: 'Dumbbell' },
  { id: 'money',  label: 'Money',  blurb: 'Your bank, sorted',               color: '#3b82f6', icon: 'Wallet'   },
  { id: 'life',   label: 'Life',   blurb: "What's coming, what happened",    color: '#a855f7', icon: 'Plane'    },
] as const
