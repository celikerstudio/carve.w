import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LandingNav } from '@/components/landing/LandingNav'
import { WorkoutsDemo } from '@/components/landing/WorkoutsDemo'
import { FoodDemo } from '@/components/landing/FoodDemo'
import { DOMAINS } from '@/lib/domains'
import { SHOW_WEB_APP } from '@/lib/flags'

// @ai-context: Dit was tot TDR-0002 een fitness-dashboard met nepdata in lichte
// kleuren, overgebleven uit de wiki-periode. Het is nu de bestemming van de
// kaarten op de homepage: de simulatie die daarvoor op / stond, met het gekozen
// domein als startpunt.
export const metadata = {
  title: 'Carve — See it work',
  description: 'A conversation with Carve on demo data. No account needed.',
  robots: 'noindex',
}

// @ai-why: `d` is de domein-parameter uit de kaartklik op de homepage. Een
// onbekende waarde geeft een 404 en geen stille terugval op health: dan zou een
// typefout of een verlopen link er als een werkende demo uitzien.
// @ai-sync: components/landing/DomainCardLink.tsx zet deze parameter.
export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>
}) {
  // @ai-why: Onderdeel van het web-platform, uit in productie sinds 2026-09-05.
  // @ai-sync: lib/flags.ts (SHOW_WEB_APP)
  if (!SHOW_WEB_APP) notFound()

  const { d } = await searchParams
  const domain = DOMAINS.find((entry) => entry.id === d)
  if (!domain) notFound()

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <LandingNav />

      <main className="pt-28 pb-20">
        <header className="max-w-[1100px] mx-auto px-4 md:px-6 mb-8">
          <Link
            href="/"
            className="text-[12.5px] text-white/30 hover:text-white/60 transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded"
          >
            ← Pick another direction
          </Link>

          <div className="flex items-baseline gap-3 mt-5">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: domain.color }}
            >
              {domain.label}
            </span>
            <span className="text-[12px] text-white/25">Demo data · nothing here is yours yet</span>
          </div>

          <h1 className="text-[1.9rem] md:text-[2.4rem] font-extrabold tracking-[-0.03em] leading-[1.1] mt-2 text-balance">
            {domain.id === 'workouts'
              ? "Your workout is in. Here's what it did."
              : domain.id === 'food'
                ? 'Scan it, shoot it, or just say it.'
                : 'This is what it looks like when it knows you.'}
          </h1>
        </header>

        {/* @ai-why: Workouts heeft een eigen component in plaats van een chatscript.
            De demo draait daar om het silhouet en de hypertrofiebalken, en die
            passen niet in het paneel-per-stap-model van LandingDemo. */}
        {/* @ai-why: Sinds TDR-0004 kent DOMAINS alleen nog workouts en food, en die
            hebben allebei een eigen component. De LandingDemo-tak (money, life) is
            daarmee onbereikbaar en is hier weg; het scriptsysteem zelf staat geparkeerd
            in components/landing/demo-steps.ts. */}
        {domain.id === 'workouts' ? <WorkoutsDemo /> : <FoodDemo />}

        {/* @ai-why: Alleen nog voor money en life. Workouts en food dragen de
            aanmelding in de voetbalk van het kader zelf; een tweede CTA eronder zou
            de bezoeker de keuze geven tussen twee knoppen die hetzelfde doen, en
            eentje daarvan navigeert weg van het paneel dat het argument is. */}
        {/* @ai-why: Workouts en food dragen de aanmelding in de voetbalk van het kader
            zelf. Sinds TDR-0004 zijn dat de enige twee domeinen, dus deze tweede CTA
            komt nooit meer voor; hij stond hier voor money en life. */}
      </main>
    </div>
  )
}
