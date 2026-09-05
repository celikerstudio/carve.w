import { CarveMarketingPage } from '@/components/carve/CarveMarketingPage'

// @ai-why: De pagina zelf is een client component (framer-motion, useState); een dunne
// server-wrapper eromheen is de enige plek waar `metadata` mag staan. Sinds TDR-0005
// rendert `/` dezelfde component, dus dit bestand bestaat om de oude URL geldig te
// houden en om deze route zijn eigen title/description te geven.
// @ai-sync: app/(landing)/page.tsx
export const metadata = {
  title: 'Carve AI — Fitness Coach',
  description: 'Logs your food from a photo. Tracks the muscles you are skipping. Built by someone who lost 50kg using it.',
}

export default function CarveRoute() {
  return <CarveMarketingPage />
}
