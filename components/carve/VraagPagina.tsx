import Image from 'next/image';
import Link from 'next/link';
import { AppStoreButton } from '@/components/carve/AppStoreButton';
import { SiteHeader } from '@/components/site/SiteHeader';
import { CarveFooter } from '@/components/carve/CarveFooter';
import { marketingCopy } from '@/lib/marketing-copy';
import { VRAAGPAGINA_LABELS as L, VRAAGPAGINAS, type VraagPagina as VraagPaginaData } from '@/lib/vraagpaginas';

/**
 * Eén vraagpagina onder `/nl/` (TDR-0014).
 *
 * @ai-why: Opgebouwd voor een lezer die de pagina niet ziet maar leest: een model dat
 * hem citeert, of een crawler. Daarom staat alles als gewone tekst in de HTML, in de
 * volgorde vraag, antwoord, hoe het werkt, alternatieven, vragen. Geen uitklapmenu's
 * voor de FAQ, geen tekst in plaatjes, geen client-side rendering. De eerste alinea
 * onder de h1 is wat er geciteerd wordt, dus die draagt het antwoord.
 *
 * @ai-why: De alternatieven staan er echt, met waar ze beter zijn. Een pagina die alleen
 * zichzelf aanprijst wordt minder vaak aangehaald dan een die de afweging maakt, en een
 * bezoeker die al Hevy gebruikt gelooft de rest van de pagina niet als Hevy ontbreekt.
 *
 * @ai-why: Kop en voet zoals `LegalPage`, niet de marketingpagina met telefoon en
 * scrollverhaal. Deze pagina is een antwoord, geen show. Het logo linkt naar `/nl/app`,
 * waar de show wel staat.
 *
 * @ai-sync: lib/vraagpaginas.ts (de inhoud)
 * @ai-sync: lib/marketing-seo.ts (vraagFaqJsonLd rendert dezelfde `faq`)
 * @ai-sync: components/carve/LegalPage.tsx (dezelfde kop en typografie)
 */
export function VraagPagina({ pagina }: { pagina: VraagPaginaData }) {
  const anderen = VRAAGPAGINAS.filter((p) => p.slug !== pagina.slug);

  return (
    <div lang="nl" className="min-h-screen bg-[#0A0A0B] text-white">
      <SiteHeader taal="nl" />

      <main className="mx-auto max-w-[760px] px-6 pt-10 pb-20 md:pt-16">
        <article>
          <h1 className="text-[clamp(30px,5vw,46px)] font-bold leading-[1.08] tracking-[-0.025em] text-balance">
            {pagina.vraag}
          </h1>
          <p className="mt-6 text-[18px] leading-relaxed text-white/75">{pagina.antwoord}</p>
          <div className="mt-8 flex flex-col items-start gap-2">
            <AppStoreButton source="hero" />
            <small className="text-[13px] text-white/30">{L.onderKnop}</small>
          </div>

          <section className="mt-16">
            <H2>{pagina.stappenKop}</H2>
            <ol className="mt-8 space-y-10">
              {pagina.stappen.map((stap, i) => (
                <li key={stap.titel} className="grid items-center gap-6 sm:grid-cols-[1fr_200px]">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#D4A843]">{L.stap} {i + 1}</p>
                    <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.01em]">{stap.titel}</h3>
                    <p className="mt-2 text-[15.5px] leading-relaxed text-white/60">{stap.tekst}</p>
                  </div>
                  {stap.screenshot && stap.alt ? (
                    <Image
                      src={stap.screenshot}
                      alt={stap.alt}
                      width={1260}
                      height={2736}
                      sizes="200px"
                      className="mx-auto h-auto w-[200px] rounded-[26px] border border-white/[0.08]"
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-16">
            <H2>{pagina.vergelijking.kop}</H2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-white/60">{pagina.vergelijking.intro}</p>
            <dl className="mt-6 space-y-3">
              {pagina.vergelijking.apps.map((app) => (
                <div key={app.naam} className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-5">
                  <dt className="text-[16px] font-semibold">{app.naam}</dt>
                  <dd className="mt-1.5 text-[15px] leading-relaxed text-white/60">{app.tekst}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-[15.5px] leading-relaxed text-white/75">{pagina.vergelijking.carve}</p>
          </section>

          <section className="mt-16">
            <H2>{L.faqKop}</H2>
            <div className="mt-6 divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {pagina.faq.map((item) => (
                <div key={item.vraag} className="py-5">
                  <h3 className="text-[16px] font-semibold">{item.vraag}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/60">{item.antwoord}</p>
                </div>
              ))}
            </div>
          </section>
        </article>

        <section className="mt-16 text-center">
          <p className="text-[clamp(26px,4vw,36px)] font-bold tracking-[-0.02em]">{L.slotKop}</p>
          <p className="mt-3 text-white/50">{L.slotTekst}</p>
          <AppStoreButton source="close" className="mt-6" />
        </section>

        <nav aria-label={L.verwantAria} className="mt-16 border-t border-white/[0.08] pt-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/40">{L.verwantKop}</p>
          <ul className="mt-4 space-y-2">
            {anderen.map((p) => (
              <li key={p.slug}>
                <Link href={p.pad} className="text-[15px] text-white/70 underline decoration-white/20 underline-offset-4 hover:text-white">
                  {p.linkLabel}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-16 text-center">
          <CarveFooter copy={marketingCopy.nl.footer} />
        </div>
      </main>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[clamp(24px,3.5vw,32px)] font-bold leading-[1.1] tracking-[-0.02em]">{children}</h2>;
}
