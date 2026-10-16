import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { CarveFooter } from '@/components/carve/CarveFooter';
import { AppStoreButton } from '@/components/carve/AppStoreButton';
import { AppStoreDock } from '@/components/carve/AppStoreDock';
import { SiteHeader } from '@/components/site/SiteHeader';
import type { MarketingCopy, Taal } from '@/lib/marketing-copy';
import { articleHref } from '@/lib/wiki/catalog';
import './marketing.css';
import { VRAAGPAGINA_LABELS, VRAAGPAGINAS } from '@/lib/vraagpaginas';

const HERO_CTA_ID = 'hero-cta';
const CLOSE_CTA_ID = 'close-cta';

/** De vier artikelen van "Start here" op /wiki, als interne links. */
const WIKI_START = [
  { titel: 'Protein', categorie: 'Nutrition', slug: 'protein' },
  { titel: 'Progressive Overload', categorie: 'Training', slug: 'progressive-overload' },
  { titel: 'Creatine', categorie: 'Supplements', slug: 'creatine' },
  { titel: 'Sleep', categorie: 'Recovery', slug: 'sleep' },
].map((a) => ({ ...a, href: articleHref(a.categorie, a.slug)! }));

/**
 * De marketingpagina voor de iOS-app, op `/` en `/carve`.
 *
 * @ai-why: Zeven blokken sinds variant A (companion, 2026-10-16), één punt per blok: wat de app
 * met je doet (het personage in vijf lijfstadia), waarom je het kunt geloven (130 → 80, met
 * foto), drie dingen die hij doet, de wiki, wat het kost, de knop. Het personage is sinds die
 * dag het beeld van de pagina, net als in de app en de wiki; het anatomische figuur en de
 * telefoon met vier schermen (PhoneStory) zijn weg. De bezoeker wil in drie seconden zien wat
 * het doet, of het werkt en hoe het eruitziet; het bewijs is de 50 kilo, niet een
 * sterrengemiddelde. Monochroom zoals de app: eiwit is groen, verder geen kleur.
 *
 * @ai-why: Tot 2026-09-05 stond hier een pagina van duizend regels met een
 * scoreboard-hero, AI-scan-demo, training, hiscores, rewards en pricing. Die
 * verkocht meer dan de app na 2026-09-04 nog doet (zie TDR-0003 en TDR-0005).
 * De componenten die daarbij hoorden (`ScoreboardCard`, `MarketingHero`,
 * `PhoneShowcase`) staan er nog maar hebben hier geen lezer meer.
 *
 * @ai-why: Server component. Alleen de knop (tracking) en de sticky knop hebben browser-API's
 * nodig; die zijn losse client components. De kop is `SiteHeader`, dezelfde als op de rest van de site.
 *
 * @ai-sync: ~/Developer/Carve-AI/docs/marketing/app-store-listing.md (dezelfde belofte, dezelfde screenshots)
 * @ai-sync: app/opengraph-image.tsx (dezelfde belofte, als beeld)
 *
 * @ai-why: De tekst komt sinds TDR-0012 uit `lib/marketing-copy.ts` en staat niet meer
 * in deze JSX. De pagina bestaat in twee talen op twee adressen; welke taal je krijgt
 * bepaalt de route, niet de browser.
 * @ai-gotcha: `lang` staat hier en niet op `<html>`. De root-layout zet `en` voor de hele
 * site en dat is per route niet te veranderen zonder alles onder een `[lang]`-segment te
 * hangen. Het dichtstbijzijnde `lang` wint bij screenreaders en bij Google, dus dit werkt,
 * maar de `<html>` van `/nl/app` zegt iets anders dan de pagina. Staat als consequentie
 * in de TDR.
 * @ai-sync: lib/marketing-copy.ts (de vorm van `copy`)
 * @ai-sync: app/layout.tsx (de `<html lang="en">` die hier gecorrigeerd wordt)
 * @ai-sync: docs/tdr/0012-de-marketingpagina-krijgt-een-nederlandse-variant.md
 */
export function CarveMarketingPage({ copy, taal }: { copy: MarketingCopy; taal: Taal }) {
  return (
    <div id="top" lang={taal} className="min-h-screen w-full bg-[#0A0A0B] text-white">
      <SiteHeader taal={taal} current="About" />
      {/* 1 · groei */}
      {/* @ai-why: Variant A uit de companion (2026-10-16): het personage in zijn vijf lijfstadia,
          van Start tot Beest. Het laat in één beeld zien wat de app met je doet, zonder dat de
          bezoeker iets hoeft te lezen. Tot die dag stond hier het anatomische figuur met een
          weekschema en een telefoon die vier schermen liet zien (PhoneStory): ruim 10.000 pixels
          scrollen voor wie het hele verhaal wilde, en een figuur dat de app niet meer gebruikt.
          @ai-sync: public/character/ (kopieën uit de asset-catalogus van de app) */}
      <section className="mk-spot flex flex-col items-center px-6 pt-16 text-center md:pt-24">
        <h1 className="text-[clamp(44px,8vw,88px)] font-extrabold leading-[0.95] tracking-[-0.05em] text-balance">
          {copy.hero.kop}
          <br />
          <span className="text-white/30">{copy.hero.kopZacht}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[34ch] text-[clamp(17px,2vw,19px)] leading-normal text-white/60 text-balance">{copy.hero.tekst}</p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <AppStoreButton source="hero" id={HERO_CTA_ID} />
          <small className="text-[13px] text-white/40">{copy.hero.onderKnop}</small>
        </div>
        <div role="img" aria-label={copy.stadia.alt} className="mt-14 flex w-full max-w-[900px] items-end justify-center gap-1 md:mt-16 md:gap-2">
          {copy.stadia.namen.map((naam, i) => (
            <div key={naam} className="flex flex-col items-center gap-2" style={{ opacity: 0.45 + i * 0.1375 }}>
              <Figuur stadium={i + 1} className="h-[clamp(150px,30vw,340px)]" />
              <span className={`text-[12px] ${i === 4 ? 'font-semibold text-white/85' : 'text-white/40'}`}>{naam}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3 · bewijs */}
      {/* @ai-why: Twee echte foto's naast de cijfers. Tot 2026-09-06 stond hier
          alleen "130 → 80" met twee zinnen eronder; een getal zonder gezicht is
          een claim, geen bewijs. De before staat in zwart-wit en gedimd half
          achter de now, dus het oog gaat naar nu en een matige vakantiefoto
          volstaat als before. Op beide foto's een telefoon in de hand: toeval,
          maar het zegt "I still use it every day" zonder dat de tekst het hoeft.
          De 130 staat niet meer in de zin, hij staat al doorgestreept ernaast. */}
      <section className="border-y border-white/[0.06] px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-[960px] items-center gap-12 md:grid-cols-2 md:gap-14">
          <div className="relative aspect-[1000/913] w-full">
            <ProofPhoto
              src="/photos/before.jpg"
              alt={copy.bewijs.voorAlt}
              label={copy.bewijs.voorLabel}
              width={720}
              height={960}
              className="top-0 left-0"
              imageClassName="opacity-70 grayscale"
              ring="shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
            />
            <ProofPhoto
              src="/photos/now.jpg"
              alt={copy.bewijs.nuAlt}
              label={copy.bewijs.nuLabel}
              width={528}
              height={704}
              className="top-[14%] right-0 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
              ring="shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
            />
          </div>
          <div>
            <Eyebrow>{copy.bewijs.eyebrow}</Eyebrow>
            <div className="flex items-baseline gap-3.5 font-bold leading-none tracking-[-0.04em]" aria-label={copy.bewijs.getalLabel}>
              <span className="text-[clamp(40px,5vw,56px)] text-white/30 line-through decoration-white/40 decoration-[0.06em]">130</span>
              <span className="text-[clamp(96px,12vw,132px)]">
                80<small className="ml-[0.1em] text-[0.28em] font-medium tracking-normal text-white/40">{copy.bewijs.eenheid}</small>
              </span>
            </div>
            <p className="mt-5 max-w-[26ch] text-[clamp(19px,2vw,22px)] leading-[1.35] text-balance">{copy.bewijs.regel}</p>
            <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-white/40">{copy.bewijs.onderregel}</p>
          </div>
        </div>
      </section>

      {/* 4 · drie dingen */}
      {/* @ai-why: Drie kaarten met elk een beeld, in plaats van zes met twee regels tekst. De zes
          zeiden allemaal iets, maar niets sprong eruit; deze drie zijn wat een nieuwe gebruiker op
          dag één doet: een bord fotograferen, een training loggen, kijken waar hij staat.
          @ai-sync: ~/Developer/Carve-AI/docs/marketing/app-store-listing.md (dezelfde belofte) */}
      <section className="border-t border-white/[0.06] px-6 py-[72px] md:py-24">
        <div className="mx-auto max-w-[1024px]">
          <Eyebrow>{copy.drie.eyebrow}</Eyebrow>
          <H2>{copy.drie.kop}</H2>
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            <Kaart titel={copy.drie.kaarten[0].titel} tekst={copy.drie.kaarten[0].tekst}>
              <div className="rounded-2xl bg-white/[0.06] px-4 py-3 text-left">
                <p className="text-[15px] font-semibold">{copy.drie.bord}</p>
                <p className="mt-0.5 text-[13px] text-white/50">{copy.drie.bordMacro}</p>
              </div>
            </Kaart>
            <Kaart titel={copy.drie.kaarten[1].titel} tekst={copy.drie.kaarten[1].tekst}>
              <Figuur stadium={3} gloed alt={copy.drie.figuurAlt} className="h-[180px]" />
            </Kaart>
            <Kaart titel={copy.drie.kaarten[2].titel} tekst={copy.drie.kaarten[2].tekst}>
              {/* @ai-why: Groen, net als eiwit in de app (`nutritionProtein`). De enige kleur op de pagina. */}
              <div className="grid h-[110px] w-[110px] place-items-center rounded-full" style={{ background: 'conic-gradient(#30d158 0 84%, rgba(255,255,255,0.08) 0)' }}>
                <div className="grid h-[90px] w-[90px] place-items-center rounded-full bg-[#151517] text-center leading-tight">
                  <span className="text-[22px] font-bold">121</span>
                  <span className="-mt-1 block text-[11px] text-white/40">{copy.drie.ringVan}</span>
                </div>
              </div>
            </Kaart>
          </div>
          {/* @ai-why: De foto-vraag hoort hier beantwoord te worden en niet pas in het
              privacybeleid. Je vraagt iemand een foto van zijn bord naar een AI te sturen;
              dat is het eerste bezwaar dat opkomt. Kort, met een link voor wie doorleest.
              @ai-sync: app/privacy/page.tsx (dezelfde belofte, uitgebreid)
              @ai-sync: ~/Developer/Carve-AI/Carve AI/App/Config/FeatureFlags.swift (HealthKit-claim: alleen stappen) */}
          <div className="mt-7 flex flex-col items-center gap-1.5 text-center text-[13px] text-white/35">
            <p>{copy.drie.health}</p>
            <p>
              {copy.drie.privacy}{' '}
              <Link href="/privacy" className="underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/60">
                {copy.drie.privacyLink}
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 5 · wiki */}
      {/* @ai-why: De wiki als bewijs dat Carve weet waar het over praat, en als interne link naar
          de artikelen (TDR-0016). Vier vaste artikelen: de vier van "Start here" op /wiki.
          @ai-sync: app/wiki/page.tsx (START_HERE) */}
      <section className="border-t border-white/[0.06] px-6 py-[72px] md:py-24">
        <div className="mx-auto grid max-w-[1024px] items-center gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <Eyebrow>{copy.wiki.eyebrow}</Eyebrow>
            <H2>{copy.wiki.kop}</H2>
            <p className="mt-4 max-w-[36ch] text-white/55">{copy.wiki.tekst}</p>
            <Link href="/wiki" className="mt-6 inline-block text-[15px] text-white/80 underline decoration-white/25 underline-offset-4 hover:text-white">
              {copy.wiki.alles}
            </Link>
          </div>
          <div className="overflow-hidden rounded-[20px] border border-white/[0.08] bg-white/[0.04]">
            {WIKI_START.map((a, i) => (
              <Link key={a.href} href={a.href} className={`flex items-center justify-between px-5 py-4 text-[16px] transition-colors hover:bg-white/[0.03] ${i ? 'border-t border-white/[0.06]' : ''}`}>
                {a.titel}
                <span className="text-[14px] text-white/40">{a.categorie} ›</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · prijs */}
      {/* @ai-why: De pagina zei twee keer "Free" en verder niets, terwijl er een paywall
          achter zit. Wie die pas in de app tegenkomt voelt zich beetgenomen, en dat is
          precies de recensie die je niet wilt. Deze sectie zegt wat gratis is, wat de
          proefperiode is en waar Pro voor is.
          @ai-why: Geen bedrag op de pagina. StoreKit toont de prijs in de valuta van de
          storefront van de bezoeker, dus elk bedrag hier klopt maar voor één land en
          veroudert bij de eerste prijswijziging zonder dat iemand het merkt. Het bedrag
          staat één klik verderop in de App Store, waar het altijd klopt.
          @ai-sync: ~/Developer/Carve-AI/supabase/migrations/20260717130000_launch_generous_ai_quota.sql (25/dag, 30 dagen trial)
          @ai-sync: ~/Developer/Carve-AI/Carve AI/Resources/en.lproj/Localizable.strings (pro.upgrade.bullet.*) */}
      <section className="border-t border-white/[0.06] px-6 py-[72px] md:py-24">
        <div className="mx-auto max-w-[880px]">
          <div className="text-center">
            <Eyebrow>{copy.prijs.eyebrow}</Eyebrow>
            <H2>{copy.prijs.kop}</H2>
            <p className="mx-auto mt-4 max-w-[46ch] text-white/50 text-balance">{copy.prijs.intro}</p>
          </div>
          {/* @ai-why: Eén kolom, geen twee kaarten. Twee kaarten naast elkaar lezen als
              een keuze tussen gelijkwaardige plannen, terwijl de boodschap is dat Free de
              app is en Pro erbovenop komt. "Pro adds" onder de Free-regels zegt dat met
              de vorm zelf. Smaller is ook rustiger op de telefoon waar de bezoeker vandaan
              komt. Alternatieven (vergelijktabel, tijdlijn van de proefperiode, één
              Pro-kaart, typografisch statement) zijn op 2026-09-08 bekeken en afgewezen. */}
          <div className="mx-auto mt-11 max-w-[520px]">
            <PlanHead name={copy.prijs.gratisNaam} tag={copy.prijs.gratisTag} />
            <ul>
              {copy.prijs.gratisRegels.map((regel) => (
                <PlanLine key={regel}>{regel}</PlanLine>
              ))}
            </ul>
            <PlanHead name={copy.prijs.proNaam} pro tag={copy.prijs.proTag} />
            <ul>
              {copy.prijs.proRegels.map((regel) => (
                <PlanLine key={regel}>{regel}</PlanLine>
              ))}
            </ul>
          </div>
          <p className="mt-6 text-center text-[13px] text-white/30">{copy.prijs.proef}</p>
        </div>
      </section>

      {/* 7 · slot */}
      <section className="border-t border-white/[0.06] px-6 pt-20 pb-16 text-center md:pt-28 md:pb-24">
        <Image src="/carve-logo.png" alt="" width={160} height={160} className="mx-auto mb-5 h-12 w-12" />
        <H2 className="text-[clamp(36px,6vw,64px)]">{copy.slot.kop}</H2>
        <p className="mx-auto mt-4 max-w-[36ch] text-white/50 text-balance">{copy.slot.tekst}</p>
        <AppStoreButton source="close" id={CLOSE_CTA_ID} className="mt-8" />
        <p className="mt-4 text-[13px] text-white/30">{copy.slot.onderKnop}</p>
        {/* @ai-why: De vraagpagina's van TDR-0014 hebben een interne link nodig, anders
            vindt een crawler ze alleen via de sitemap. Alleen op de Nederlandse pagina:
            ze zijn Nederlands, en op `/app` zou een Engelse bezoeker in een andere taal
            belanden zonder dat de link dat zegt.
            @ai-sync: lib/vraagpaginas.ts */}
        {taal === 'nl' ? (
          <nav aria-label={VRAAGPAGINA_LABELS.verwantAria} className="mx-auto mt-14 flex max-w-[640px] flex-wrap justify-center gap-x-6 gap-y-2 text-[14px]">
            {VRAAGPAGINAS.map((p) => (
              <Link key={p.slug} href={p.pad} className="text-white/45 underline decoration-white/15 underline-offset-4 transition-colors hover:text-white/75">
                {p.linkLabel}
              </Link>
            ))}
          </nav>
        ) : null}
        <div className="mx-auto mt-20 max-w-5xl">
          <CarveFooter copy={copy.footer} />
        </div>
      </section>

      <AppStoreDock heroId={HERO_CTA_ID} closeId={CLOSE_CTA_ID} />
    </div>
  );
}

/* ---------------------------------------------------------------------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3.5 text-[13px] text-white/40">{children}</p>;
}

function H2({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-[clamp(32px,5vw,52px)] font-bold leading-[1.06] tracking-[-0.025em] text-balance ${className}`}>{children}</h2>
  );
}

interface ProofPhotoProps {
  src: string;
  alt: string;
  label: string;
  width: number;
  height: number;
  /** Positie en buitenschaduw. */
  className: string;
  imageClassName?: string;
  /** Inset-rand. Staat op een los laagje, want een inset-shadow op de wrapper
      verdwijnt achter de afbeelding. */
  ring: string;
}

function ProofPhoto({ src, alt, label, width, height, className, imageClassName = '', ring }: ProofPhotoProps) {
  return (
    <figure className={`absolute aspect-[3/4] w-[58%] overflow-hidden rounded-[20px] ${className}`}>
      <Image src={src} alt={alt} width={width} height={height} sizes="(min-width: 768px) 280px, 60vw" className={`h-full w-full object-cover ${imageClassName}`} />
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 rounded-[20px] ${ring}`} />
      <figcaption className={`absolute bottom-3.5 left-3.5 rounded-full bg-[#0A0A0B]/60 px-2.5 py-1.5 text-[11px] font-medium tracking-[0.2em] uppercase backdrop-blur-sm text-white/70`}>{label}</figcaption>
    </figure>
  );
}

function PlanHead({ name, tag, pro }: { name: string; tag: string; pro?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 pb-1.5 ${pro ? 'mt-7' : ''}`}>
      <h3 className="text-[19px] font-bold tracking-[-0.01em]">{name}</h3>
      <p className="text-right text-[13px] text-white/35">{tag}</p>
    </div>
  );
}

function PlanLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 border-b border-white/[0.06] py-3 text-[15px] leading-snug text-white/70">
      <Check className="mt-[3px] h-4 w-4 shrink-0 text-white/40" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

function Kaart({ titel, tekst, children }: { titel: string; tekst: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.04]">
      <div className="flex h-[220px] items-center justify-center bg-white/[0.02] px-8">{children}</div>
      <div className="px-6 pt-5 pb-6">
        <h3 className="text-[20px] font-bold tracking-[-0.02em]">{titel}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-white/55">{tekst}</p>
      </div>
    </div>
  );
}

/**
 * Het Carve-personage: de man, op een lijfstadium, met het kapsel erop.
 *
 * @ai-why: Drie lagen van dezelfde tekening als in de app. Met `gloed` legt hij de felle tekening
 *   door de maskers van borst, schouders en triceps (een push-dag) en laat die op- en uitgloeien.
 * @ai-fragile: De plaatjes in `public/character/` zijn kopieën uit de asset-catalogus van de app
 *   (Carve-AI `Assets.xcassets/character`), verkleind tot 1000 px hoog. Wordt het personage daar
 *   opnieuw gegenereerd, kopieer ze dan opnieuw.
 */
function Figuur({ stadium, gloed, alt, className = '' }: { stadium: number; gloed?: boolean; alt?: string; className?: string }) {
  return (
    <div className={`relative aspect-[581/1400] ${className}`} role={alt ? 'img' : undefined} aria-label={alt} aria-hidden={alt ? undefined : true}>
      {/* eslint-disable-next-line @next/next/no-img-element -- lagen die exact op elkaar moeten vallen */}
      <img src={gloed ? '/character/character_man_s3_front_faded.png' : `/character/character_man_s${stadium}_front.png`} alt="" className="absolute inset-0 h-full w-full" />
      {gloed && <div className="mk-lit absolute inset-0" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/character/character_man_front_hair_crew.png" alt="" className="absolute inset-0 h-full w-full" />
    </div>
  );
}
