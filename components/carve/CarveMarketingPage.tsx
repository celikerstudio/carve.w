import Image from 'next/image';
import { CarveFooter } from '@/components/carve/CarveFooter';
import { AppStoreButton } from '@/components/carve/AppStoreButton';
import { AppStoreDock } from '@/components/carve/AppStoreDock';
import { MuscleFigure } from '@/components/carve/MuscleFigure';

const HERO_CTA_ID = 'hero-cta';
const CLOSE_CTA_ID = 'close-cta';

/**
 * De marketingpagina voor de iOS-app, op `/` en `/carve`.
 *
 * @ai-why: Zes schermen, één punt per scherm, in deze volgorde: wat het doet
 * (figuur), hoe je logt (foto), waarom je het kunt geloven (130 → 80), wat er
 * anders is (spierkaart), de coach, de knop. De bezoeker komt via een bio-link
 * op zijn telefoon en vergelijkt in zijn hoofd met MyFitnessPal; hij wil in drie
 * seconden zien wat het doet, of het werkt en hoe het eruitziet. Alles wat dat
 * niet dient staat er niet: geen rangen, geen season, geen pricing, geen
 * nagebouwde kaarten. Het bewijs is de 50 kilo, niet een sterrengemiddelde.
 *
 * @ai-why: Tot 2026-09-05 stond hier een pagina van duizend regels met een
 * scoreboard-hero, AI-scan-demo, training, hiscores, rewards en pricing. Die
 * verkocht meer dan de app na 2026-09-04 nog doet (zie TDR-0003 en TDR-0005).
 * De componenten die daarbij hoorden (`ScoreboardCard`, `MarketingHero`,
 * `PhoneShowcase`) staan er nog maar hebben hier geen lezer meer.
 *
 * @ai-why: Server component. Alleen de knop (tracking), de sticky knop en het
 * figuur hebben browser-API's nodig; die zijn losse client components.
 *
 * @ai-sync: ~/Developer/Carve-AI/docs/marketing/app-store-listing.md (dezelfde belofte, dezelfde screenshots)
 * @ai-sync: app/opengraph-image.tsx (dezelfde belofte, als beeld)
 * @ai-sync: components/carve/MuscleFigure.tsx (het weekschema, zelfde week als de goal-screenshot)
 */
export function CarveMarketingPage() {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-white">
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
        <MuscleFigure />
      </section>

      {/* 2 · foto */}
      <section className="mt-10 border-t border-white/[0.06] px-6 py-[72px] md:mt-14 md:py-24">
        <div className="mx-auto grid max-w-[960px] items-center gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <Eyebrow>Snap it</Eyebrow>
            <H2>Logged.</H2>
            <Body>
              Take a picture of your plate. The AI works out the calories and macros.{' '}
              <b>No database digging, no guessing portions.</b> Scan a barcode when the packet is in your hand.
            </Body>
          </div>
          <div className="relative">
            <Image
              src="/screenshots/food-photo.png"
              alt="Carve on an iPhone showing a logged meal: aubergine lasagne with mozzarella, 434 kcal, with protein, carbs and fat."
              width={1240}
              height={1900}
              sizes="(min-width: 768px) 460px, 100vw"
              className="h-auto w-full rounded-3xl"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
          </div>
        </div>
      </section>

      {/* 3 · bewijs */}
      <section className="border-y border-white/[0.06] px-6 py-20 text-center md:py-28">
        <Eyebrow gold>Why it exists</Eyebrow>
        <div className="flex items-baseline justify-center gap-4 font-bold leading-none tracking-[-0.04em]" aria-label="From 130 to 80 kilograms">
          <span className="text-[clamp(48px,8vw,96px)] text-white/30 line-through decoration-[#D4A843] decoration-[0.06em]">130</span>
          <span className="text-[clamp(22px,3vw,34px)] font-normal text-white/30">→</span>
          <span className="text-[clamp(80px,14vw,168px)]">
            80<small className="ml-[0.1em] text-[0.28em] font-medium tracking-normal text-white/40">kg</small>
          </span>
        </div>
        <p className="mx-auto mt-7 max-w-[32ch] text-[clamp(18px,2.2vw,24px)] leading-[1.4] text-balance">
          I was 130 kg. I built this app while losing 50 of it.
          <small className="mt-3 block text-sm text-white/40">It started as a food tracker for myself. It turned into a coach. I use it every day.</small>
        </p>
      </section>

      {/* 4 · spierkaart */}
      <FeatureRow
        eyebrow="Skipping legs?"
        title="You'll see it."
        chip="Most trackers stop at the number."
        image="/screenshots/legs.png"
        alt="Muscle map from the back with untrained legs and arms highlighted."
      >
        Log your workout, sets and weights. The muscle map fills in where you trained and{' '}
        <b>stays empty where you didn&apos;t</b>. Front and back.
      </FeatureRow>

      {/* 5 · coach */}
      <FeatureRow
        flip
        eyebrow="Ask anything"
        title="Carve adds it."
        image="/screenshots/ask.png"
        alt="Chat with Carve: the message 'Add chest and shoulders today' saved as a workout."
      >
        &ldquo;Add chest and shoulders today&rdquo; is a logged workout. Your food and your training live in the same place, so{' '}
        <b>the coach can see what you logged</b> and answer about your week.
      </FeatureRow>

      {/* 6 · slot */}
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

function Body({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 max-w-[40ch] text-[clamp(16px,1.6vw,18px)] text-white/50 [&_b]:font-medium [&_b]:text-white/80">{children}</p>;
}

interface FeatureRowProps {
  eyebrow: string;
  title: string;
  chip?: string;
  image: string;
  alt: string;
  flip?: boolean;
  children: React.ReactNode;
}

/**
 * Tekst naast een telefoonscherm; op mobiel onder elkaar, tekst eerst.
 *
 * @ai-gotcha: De screenshots in `public/screenshots/` zijn uitsneden van de App
 * Store-set en houden een randje van de grijze store-achtergrond om de telefoon.
 * Het beeld staat daarom 3% te groot in een kader met de hoekradius van de
 * telefoon, zodat dat randje buiten de clip valt. Exporteer je ooit strakke
 * schermen, dan kan die overmaat weg.
 */
function FeatureRow({ eyebrow, title, chip, image, alt, flip, children }: FeatureRowProps) {
  return (
    <section className="border-t border-white/[0.06] px-6 py-[72px] md:py-24">
      <div className="mx-auto grid max-w-[960px] items-center gap-8 md:grid-cols-2 md:gap-12">
        <div className={flip ? 'md:order-2' : ''}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <H2>{title}</H2>
          <Body>{children}</Body>
          {chip ? (
            <span className="mt-5 inline-block rounded-full border border-white/[0.08] px-3.5 py-1.5 text-[13px] text-white/40">{chip}</span>
          ) : null}
        </div>
        <div className="relative grid max-h-[380px] justify-items-center overflow-hidden md:max-h-[520px]">
          <div className="relative aspect-[1052/1853] w-[min(100%,280px)] overflow-hidden rounded-t-[14%_8%] bg-[#0e0e0f] shadow-[0_30px_80px_rgba(0,0,0,0.6)] md:w-[min(100%,320px)]">
            <Image
              src={image}
              alt={alt}
              width={1052}
              height={1853}
              sizes="320px"
              className="absolute top-[-1.5%] left-[-1.5%] h-auto w-[103%] max-w-none"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-b from-transparent to-[#0A0A0B]" />
        </div>
      </div>
    </section>
  );
}
