import Link from 'next/link'
import { DOMAINS } from '@/lib/domains'
import { DomainCardLink } from './DomainCardLink'

// @ai-why: Server component, en de animatie is CSS (.carve-fade-up in globals.css)
// in plaats van framer-motion. Framer zet zijn `initial` als inline style in de
// SSR-HTML, dus de broncode van / bevatte letterlijk `style="opacity:0"` op de
// h1 en op alle drie de kaarten. Bij de oude homepage viel dat weg tegen de rest
// van de pagina; nu ís dit de hele pagina, dus zonder JS was er niets te zien.
// Alleen de kaart-link zelf is een client component, want die tikt analytics aan.
export function DomainPicker() {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-5 py-24">
      <div className="w-full max-w-[560px] flex flex-col items-center">
        <h1
          className="carve-fade-up text-[2.5rem] md:text-[2.8rem] font-extrabold tracking-[-0.04em]
                     leading-[1.08] text-center text-white mb-2.5 text-balance"
        >
          Where do you want to start?
        </h1>

        {/* @ai-why: Zonder deze regel vraagt de kop om een intentie terwijl de
            kaarten een categorie geven. Zie TDR-0001 beslissing 2. */}
        <p
          className="carve-fade-up text-[15px] text-white/40 text-center mb-11"
          style={{ animationDelay: '0.1s' }}
        >
          Pick a direction. We&apos;ll take it from there.
        </p>

        <div className="flex flex-col gap-3 w-full">
          {DOMAINS.map((domain, i) => (
            <DomainCardLink
              key={domain.id}
              id={domain.id}
              label={domain.label}
              blurb={domain.blurb}
              color={domain.color}
              icon={domain.icon}
              delay={0.15 + i * 0.06}
            />
          ))}
        </div>

        {/* @ai-why: Eén regel bewijs. Koud verkeer landt hier op drie knoppen en
            heeft drie vragen: wat kost dit, moet ik een account maken, en moet ik
            mijn bank koppelen. Die laatste is specifiek voor Carve en is de reden
            dat de tweede zin er staat. Zie TDR-0001, consequenties. */}
        <p
          className="carve-fade-up text-[12.5px] text-white/30 text-center mt-6"
          style={{ animationDelay: '0.35s' }}
        >
          See it work on demo data. No account, no bank connection.{' '}
          {/* @ai-todo: wijst naar /carve tot /how-it-works bestaat (TDR-0001 beslissing 6) */}
          <Link href="/carve" className="underline underline-offset-2 hover:text-white/60 transition-colors">
            How it works
          </Link>
        </p>

        <div
          className="carve-fade-up w-full flex items-center gap-3 mt-8 mb-5"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="h-px flex-1 bg-white/[0.08]" />
          <span className="text-[13px] text-white/30">or</span>
          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>

        <Link
          href="/login"
          className="carve-fade-up text-[13.5px] text-white/40 hover:text-white transition-colors
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded"
          style={{ animationDelay: '0.45s' }}
        >
          Already have an account? <span className="font-semibold text-[#fafafa]">Log in</span>
        </Link>
      </div>
    </main>
  )
}
