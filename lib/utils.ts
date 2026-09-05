import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// @ai-why: Zonder landcode in het pad. Apple stuurt de bezoeker dan naar zijn eigen
// storefront; met `/us/` erin krijgt een Nederlandse bezoeker de Amerikaanse winkel te
// zien en moet hij zelf wisselen voor hij kan downloaden.
// @ai-gotcha: Het getal is de App Store-id en die stond tot 2026-09-05 op 6745400881.
// Die id bestaat niet en gaf een 404 op elke Download-knop op de site. Wijzig je dit,
// controleer dan met `curl -sIL <url>` dat er een 200 terugkomt.
export const APP_STORE_URL = "https://apps.apple.com/app/carve-ai/id6742664476"
