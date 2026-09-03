import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingDemo } from '@/components/landing/LandingDemo'
import { DemoSignupCta } from '@/components/landing/DemoSignupCta'
import { DOMAINS, type DomainId } from '@/lib/domains'

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
            This is what it looks like when it knows you.
          </h1>
        </header>

        <LandingDemo domain={domain.id as DomainId} />

        <DemoSignupCta domain={domain.id} />
      </main>
    </div>
  )
}
