/**
 * De uitnodigingslink van de app: `https://carve.wiki/u/<handle>`.
 *
 * @ai-why: De app deelde tot 2026-10-15 `carveai://u/<handle>`. Dat schema is in WhatsApp
 * niet aan te tikken, en wie de app niet heeft kwam er nergens mee. Met deze link opent iOS
 * de app rechtstreeks (via het AASA-bestand hieronder), en zonder app staat hier een pagina
 * met de App Store.
 *
 * @ai-sync: ~/Developer/Carve-AI/docs/decisions/ADR-098-uitnodigen-met-een-echte-link.md
 * @ai-sync: ~/Developer/Carve-AI/Carve AI/App/Services/Social/SocialService+Friends.swift (shareURL)
 * @ai-sync: ~/Developer/Carve-AI/Carve AI/App/Models/UsernameRules.swift (lengte en tekens)
 */

/** Team-ID plus bundle-ID van de iOS-app, zoals Apple hem in het AASA-bestand verwacht. */
export const APP_ID = 'AR9T5VTNJX.Celiker-Studio.Carve-AI'

/**
 * Het AASA-bestand: welke paden op carve.wiki de app mogen openen.
 *
 * @ai-why: Alleen `/u/*`. De rest van de site (de marketingpagina, de vraagpagina's, de
 * cockpit) moet in de browser blijven, ook bij wie de app heeft.
 * @ai-gotcha: Apple haalt dit bestand op via zijn eigen CDN en cachet het. Een wijziging
 * hier komt pas bij gebruikers aan na een nieuwe installatie of als die cache verloopt, dus
 * test een nieuw pad eerst met een verse installatie.
 */
export const AASA = {
  applinks: {
    details: [
      {
        appIDs: [APP_ID],
        components: [{ '/': '/u/*', comment: 'Uitnodiging: het profiel van wie de link deelde' }],
      },
    ],
  },
} as const

/**
 * De handle uit de URL, opgeschoond, of `null` als hij niet kan bestaan.
 *
 * @ai-why: Dezelfde grenzen als de app (3 tot 20 tekens, letters, cijfers en underscore).
 * Een handle die de app nooit uitgeeft, krijgt hier een 404 in plaats van een pagina die
 * iemand uitnodigt namens een naam die niet bestaat.
 * @ai-gotcha: `decodeURIComponent` gooit op een kapotte codering (`%E0`). Dat is een
 * ongeldige handle, geen serverfout.
 */
export function handleUitUrl(raw: string): string | null {
  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return null
  }
  const handle = decoded.trim().replace(/^@/, '').toLowerCase()
  return /^[a-z0-9_]{3,20}$/.test(handle) ? handle : null
}
