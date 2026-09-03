// @ai-why: Eén bron voor de domeinen van Carve, gelezen door zowel de publieke
// homepage (server-gerenderd) als de AppSwitcher in de chat (client). Vóór
// TDR-0001 stond de lijst als niet-geëxporteerde `const apps` in
// components/chat/AppSwitcher.tsx: een 'use client'-bestand met LucideIcon-
// componenten als veldwaarde, en dus onleesbaar vanaf een server component.
// Daarom is `icon` hier een naam en geen component: pure data, geen React.
// Model: ilvlup/lib/wizard/constants.ts, waar homepage en wizard uit dezelfde
// constante lezen zonder component in het pad.
// Zie docs/tdr/0001-homepage-is-een-keuzescherm.md beslissing 3.

export type DomainId = 'workouts' | 'food' | 'money' | 'life'

/** Naam van een lucide-react icoon. Consumers mappen zelf naar het component. */
export type DomainIconName = 'Dumbbell' | 'Apple' | 'Wallet' | 'Plane'

export interface Domain {
  id: DomainId
  /**
   * @ai-why: De id in de chat is niet altijd de id op de site. De AppSwitcher
   * kent 'health'; de site noemt dat domein 'workouts' omdat de kaart moet zeggen
   * wat je ermee doet en niet hoe het intern heet. Zonder dit veld zou de
   * hernoeming de chat-AppId meeslepen.
   * @ai-sync: components/chat/types.ts (AppId)
   */
  appId: 'health' | 'money' | 'life'
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
// @ai-context: De labels spiegelen bewust NIET meer de iOS-tabbalk. Die heet
// 'Health' (L10n.DomainTitle.health); de site zegt 'Workouts' omdat de kaart
// moet zeggen wat de demo laat zien. Vastgelegd 2026-09-03, zie de aanvulling
// onderaan docs/tdr/0001-homepage-is-een-keuzescherm.md. `appId` houdt de brug
// naar de chat intact.
//
// @ai-why: Workouts en Food delen `appId: 'health'`. In de app is voeding een
// onderdeel van Health; op de site is het een eigen kaart omdat scannen, fotograferen
// en macro's een eigen zwaartepunt zijn en de kaart moet zeggen wat de demo laat
// zien. Zie de aanvulling onderaan docs/tdr/0001-homepage-is-een-keuzescherm.md.
//
// @ai-todo: Inbox stond hier ooit en is weg: dat scherm bestaat niet. Vrienden komt
// erbij zodra het op web een oppervlak heeft.
export const DOMAINS: readonly Domain[] = [
  { id: 'workouts', appId: 'health', label: 'Workouts', blurb: 'Every set, on your body',       color: '#E4783E', icon: 'Dumbbell' },
  { id: 'food',     appId: 'health', label: 'Food',     blurb: 'Scan it, shoot it, say it',     color: '#22c55e', icon: 'Apple'    },
  { id: 'money',    appId: 'money',  label: 'Money',    blurb: 'Your bank, sorted',             color: '#3b82f6', icon: 'Wallet'   },
  { id: 'life',     appId: 'life',   label: 'Life',     blurb: "What's coming, what happened",  color: '#a855f7', icon: 'Plane'    },
] as const
