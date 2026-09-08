import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// @ai-why: De id staat apart omdat hij op twee plekken nodig is: in de store-URL en in
// de `apple-itunes-app`-meta die de smart banner bovenin Safari op iOS toont. Twee keer
// hetzelfde getal intikken is precies hoe de vorige fout ontstond.
// @ai-gotcha: Deze id stond tot 2026-09-05 op 6745400881. Die bestaat niet en gaf een
// 404 op elke Download-knop op de site. Wijzig je dit, controleer dan met
// `curl -sIL "https://apps.apple.com/app/id<id>"` dat er een 200 terugkomt.
// @ai-sync: app/layout.tsx (dezelfde id in de smart banner)
export const APP_STORE_ID = "6742664476"

// @ai-why: Zonder landcode in het pad. Apple stuurt de bezoeker dan naar zijn eigen
// storefront; met `/us/` erin krijgt een Nederlandse bezoeker de Amerikaanse winkel te
// zien en moet hij zelf wisselen voor hij kan downloaden.
export const APP_STORE_URL = `https://apps.apple.com/app/carve-ai/id${APP_STORE_ID}`
