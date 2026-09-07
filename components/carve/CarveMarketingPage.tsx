import Image from 'next/image';
import { Camera, ScanBarcode, Dumbbell, PersonStanding, CalendarDays, MessageSquareText } from 'lucide-react';
import { CarveFooter } from '@/components/carve/CarveFooter';
import { AppStoreButton } from '@/components/carve/AppStoreButton';
import { AppStoreDock } from '@/components/carve/AppStoreDock';
import { PhoneStory } from '@/components/carve/PhoneStory';
import { MarketingHeader } from '@/components/carve/MarketingHeader';

const HERO_CTA_ID = 'hero-cta';
const CLOSE_CTA_ID = 'close-cta';

/**
 * De marketingpagina voor de iOS-app, op `/` en `/carve`.
 *
 * @ai-why: Vijf blokken, één punt per blok, in deze volgorde: wat het doet
 * (figuur met weekschema), de app zelf (het figuur blijkt in een iPhone te
 * staan, die vast blijft en vier schermen laat zien met een kop en alinea
 * ernaast), waarom je het kunt geloven (130 → 80, met foto), het overzicht van
 * wat erin zit, de knop. Tot 2026-09-06 stonden de foto-sectie en drie losse
 * store-schermen hier als aparte secties; die zitten nu in de telefoon, zodat de
 * bezoeker één keer scrolt en de app ziet in plaats van plaatjes van de app.
 * De bezoeker komt via een bio-link op zijn telefoon en vergelijkt in zijn hoofd
 * met MyFitnessPal; hij wil in drie seconden zien wat het doet, of het werkt en
 * hoe het eruitziet. Alles wat dat niet dient staat er niet: geen rangen, geen
 * season, geen pricing, geen nagebouwde kaarten. Het bewijs is de 50 kilo, niet
 * een sterrengemiddelde.
 *
 * @ai-why: Tot 2026-09-05 stond hier een pagina van duizend regels met een
 * scoreboard-hero, AI-scan-demo, training, hiscores, rewards en pricing. Die
 * verkocht meer dan de app na 2026-09-04 nog doet (zie TDR-0003 en TDR-0005).
 * De componenten die daarbij hoorden (`ScoreboardCard`, `MarketingHero`,
 * `PhoneShowcase`) staan er nog maar hebben hier geen lezer meer.
 *
 * @ai-why: Server component. Alleen de knop (tracking), de sticky knop, de balk
 * bovenin en het telefoonverhaal hebben browser-API's nodig; die zijn losse client components.
 *
 * @ai-sync: ~/Developer/Carve-AI/docs/marketing/app-store-listing.md (dezelfde belofte, dezelfde screenshots)
 * @ai-sync: app/opengraph-image.tsx (dezelfde belofte, als beeld)
 * @ai-sync: components/carve/PhoneStory.tsx (het figuur, de telefoon en de vier schermen met hun captions)
 */
export function CarveMarketingPage() {
  return (
    <div id="top" className="min-h-screen w-full bg-[#0A0A0B] text-white">
      <MarketingHeader heroId={HERO_CTA_ID} />
      {/* 1 · figuur */}
      <section className="flex flex-col items-center px-6 pt-14 text-center md:pt-20">
        <Image src="/carve-logo.png" alt="" width={160} height={160} priority className="mb-5 h-14 w-14" />
        <p className="mb-7 pl-[0.32em] text-[15px] font-bold tracking-[0.32em] text-white/50">CARVE</p>
        <h1 className="max-w-[14ch] text-[clamp(38px,7vw,76px)] font-bold leading-[1.02] tracking-[-0.03em] text-balance">
          <span className="text-white/50">Log your food.</span>
          <br />
          Track your workouts.
        </h1>
        {/* @ai-why: De kop zegt al wat het doet, dus hier staat de tagline en niet
            nog een keer de features. Hij stond eerst in het slot; daar staat nu
            "Ready to start?", anders staat de tagline twee keer op één pagina.
            @ai-sync: ~/Developer/Carve-AI/docs/brand/identity.md (§1, tagline-regel) */}
        <p className="mt-4 text-[clamp(17px,2vw,21px)] text-white/50">Carve a better you.</p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <AppStoreButton source="hero" id={HERO_CTA_ID} />
          <small className="text-[13px] text-white/30">Free · iPhone</small>
        </div>
      </section>

      {/* 2 · de app: figuur → telefoon → vier schermen */}
      <PhoneStory />

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
              alt="Furkan at 130 kg, standing on a street in Istanbul, phone in hand."
              label="Before"
              width={720}
              height={960}
              className="top-0 left-0"
              imageClassName="opacity-70 grayscale"
              ring="shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
            />
            <ProofPhoto
              src="/photos/now.jpg"
              alt="Furkan at 80 kg, hiking with a backpack and poles, phone in hand."
              label="Now"
              gold
              width={528}
              height={704}
              className="top-[14%] right-0 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
              ring="shadow-[inset_0_0_0_1px_rgba(212,168,67,0.5)]"
            />
          </div>
          <div>
            <Eyebrow gold>Why it exists</Eyebrow>
            <div className="flex items-baseline gap-3.5 font-bold leading-none tracking-[-0.04em]" aria-label="From 130 to 80 kilograms">
              <span className="text-[clamp(40px,5vw,56px)] text-white/30 line-through decoration-[#D4A843] decoration-[0.06em]">130</span>
              <span className="text-[clamp(96px,12vw,132px)]">
                80<small className="ml-[0.1em] text-[0.28em] font-medium tracking-normal text-white/40">kg</small>
              </span>
            </div>
            <p className="mt-5 max-w-[26ch] text-[clamp(19px,2vw,22px)] leading-[1.35] text-balance">I built this app while losing 50 kg. I still use it every day.</p>
            <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-white/40">It started as a food tracker for myself. It turned into a coach.</p>
          </div>
        </div>
      </section>

      {/* 4 · overzicht */}
      <section className="border-t border-white/[0.06] px-6 py-[72px] md:py-24">
        <div className="mx-auto max-w-[1024px]">
          <div className="text-center">
            <Eyebrow>Everything in it</Eyebrow>
            <H2>One place for your food and your training.</H2>
            <p className="mx-auto mt-4 max-w-[46ch] text-white/50 text-balance">Most trackers stop at the number. Carve keeps both in the same place, so it can show you the muscle you haven&apos;t touched in nine days, right next to the week you thought went fine.</p>
          </div>
          {/* @ai-why: Zes regels, allemaal in de app van vandaag. Staat een functie
              achter een uitgezette vlag in FeatureFlags.swift, dan staat hij hier niet.
              Apple Health is bewust "steps": dat is het enige type dat de app uitleest.
              @ai-sync: ~/Developer/Carve-AI/docs/marketing/app-store-listing.md (beschrijving, "wat er uit is") */}
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Fact icon={<Camera className="h-5 w-5" />} title="Photo logging">A picture of your plate becomes calories and macros. No database digging.</Fact>
            <Fact icon={<ScanBarcode className="h-5 w-5" />} title="Barcode scanner">Point at the packet. The product and its macros are filled in.</Fact>
            <Fact icon={<Dumbbell className="h-5 w-5" />} title="Workout log">Sets, weights, done. Every session fills the muscle map.</Fact>
            <Fact icon={<PersonStanding className="h-5 w-5" />} title="Muscle map, front and back">See what you trained this week and what you keep skipping.</Fact>
            <Fact icon={<CalendarDays className="h-5 w-5" />} title="Week plan">Set a goal, a split and your training days once. The week is on your home screen.</Fact>
            <Fact icon={<MessageSquareText className="h-5 w-5" />} title="A coach that reads your log">Ask about your protein, your week or what to train. It answers from what you logged.</Fact>
          </div>
          <p className="mt-6 text-center text-[13px] text-white/30">Reads your daily steps from Apple Health. Nothing else.</p>
        </div>
      </section>

      {/* 5 · slot */}
      <section className="border-t border-white/[0.06] px-6 pt-20 pb-16 text-center md:pt-28 md:pb-24">
        <Image src="/carve-logo.png" alt="" width={160} height={160} className="mx-auto mb-5 h-12 w-12" />
        <H2 className="text-[clamp(36px,6vw,64px)]">Ready to start?</H2>
        <p className="mx-auto mt-4 max-w-[36ch] text-white/50 text-balance">Free on the App Store.</p>
        <AppStoreButton source="close" id={CLOSE_CTA_ID} className="mt-8" />
        <p className="mt-4 text-[13px] text-white/30">Free · iPhone · Built in Amsterdam</p>
        <div className="mx-auto mt-20 max-w-5xl">
          <CarveFooter />
        </div>
      </section>

      <AppStoreDock heroId={HERO_CTA_ID} closeId={CLOSE_CTA_ID} />
    </div>
  );
}

/* ---------------------------------------------------------------------- */

function Eyebrow({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <p className={`mb-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${gold ? 'text-[#D4A843]' : 'text-white/40'}`}>{children}</p>
  );
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
  gold?: boolean;
  width: number;
  height: number;
  /** Positie en buitenschaduw. */
  className: string;
  imageClassName?: string;
  /** Inset-rand. Staat op een los laagje, want een inset-shadow op de wrapper
      verdwijnt achter de afbeelding. */
  ring: string;
}

function ProofPhoto({ src, alt, label, gold, width, height, className, imageClassName = '', ring }: ProofPhotoProps) {
  return (
    <figure className={`absolute aspect-[3/4] w-[58%] overflow-hidden rounded-[20px] ${className}`}>
      <Image src={src} alt={alt} width={width} height={height} sizes="(min-width: 768px) 280px, 60vw" className={`h-full w-full object-cover ${imageClassName}`} />
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 rounded-[20px] ${ring}`} />
      <figcaption className={`absolute bottom-3.5 left-3.5 rounded-full bg-[#0A0A0B]/60 px-2.5 py-1.5 text-[11px] font-medium tracking-[0.2em] uppercase backdrop-blur-sm ${gold ? 'text-[#D4A843]' : 'text-white/55'}`}>{label}</figcaption>
    </figure>
  );
}

function Fact({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-white/50">{icon}</div>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-white/50">{children}</p>
    </div>
  );
}
