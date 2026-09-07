import Image from 'next/image';
import Link from 'next/link';
import { CarveFooter } from '@/components/carve/CarveFooter';

interface LegalPageProps {
  title: string;
  updated: string;
  intro?: string;
  children: React.ReactNode;
}

/**
 * Kader voor de juridische pagina's: privacy, terms en support.
 *
 * @ai-why: Eigen kop en voet, geen app-chrome. Tot 2026-09-05 stonden deze
 * pagina's als witte kaart in de zijbalk-shell van het web-platform, met de
 * navigatie (Health, Money, Life, inloggen) die sinds TDR-0005 achter een vlag
 * staat. Nu dezelfde donkere stijl als de marketingpagina, met alleen het logo
 * als weg terug. De inhoud stijlt via `[&_h2]`-selectors zodat de pagina's zelf
 * alleen platte secties hoeven te zijn.
 * @ai-sync: components/app/layout-wrapper.tsx (isPlainRoute)
 */
export function LegalPage({ title, updated, intro, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <header className="mx-auto flex max-w-[720px] items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3" aria-label="Carve home">
          <Image src="/carve-logo.png" alt="" width={160} height={160} className="h-7 w-7" />
          <span className="pl-[0.3em] text-[13px] font-bold tracking-[0.3em] text-white/70">CARVE</span>
        </Link>
        <Link href="/" className="text-sm text-white/40 transition-colors hover:text-white/70">Back to Carve</Link>
      </header>

      <main className="mx-auto max-w-[720px] px-6 pt-10 pb-20 md:pt-16">
        <h1 className="text-[clamp(32px,5vw,48px)] font-bold leading-[1.06] tracking-[-0.025em] text-balance">{title}</h1>
        <p className="mt-3 text-sm text-white/40">Last updated: {updated}</p>
        {intro ? <p className="mt-6 text-[17px] leading-relaxed text-white/60">{intro}</p> : null}

        <div
          className={[
            'mt-10 text-[15.5px] leading-relaxed text-white/60',
            '[&_section]:mt-10 [&_section:first-child]:mt-0',
            '[&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-white [&_h2]:mb-3',
            '[&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:text-white/90 [&_h3]:mt-6 [&_h3]:mb-2',
            '[&_p]:mb-4 [&_p:last-child]:mb-0',
            '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5',
            '[&_strong]:font-medium [&_strong]:text-white/85',
            '[&_a]:text-white [&_a]:underline [&_a]:decoration-white/30 [&_a]:underline-offset-4 hover:[&_a]:decoration-white',
          ].join(' ')}
        >
          {children}
        </div>

        <div className="mt-20 text-center">
          <CarveFooter />
        </div>
      </main>
    </div>
  );
}
