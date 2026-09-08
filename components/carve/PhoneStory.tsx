'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FIGURE_HEIGHT, FIGURE_SRC, FIGURE_WIDTH, LANDING_DAY, REGIONS, WEEK } from '@/components/carve/muscle-week';

interface Screen {
  eyebrow: string;
  title: React.ReactNode;
  body: React.ReactNode;
  image: string;
  alt: string;
}

// @ai-why: Kale exports van 1260 × 2736 (verhouding 9:19,5, dezelfde als de telefoon
// hieronder), rechtstreeks van het toestel. De vorige set was een ander verhaal: twee
// bestanden droegen hun eigen iPhone-rand, waar de pagina met een `framed`-vlag 12% op
// inzoomde en daarmee juist de onderste balk wegsneed, en de rest was Nederlands terwijl
// deze pagina Engels is. Die vlag is met de set verdwenen; komt er ooit weer een export
// mét rand, snijd hem dan bij in plaats van hem hier weg te zoomen.
//
// @ai-gotcha: Het bijschrift en het scherm moeten hetzelfde zeggen. Scherm 2 belooft
// daarom niet meer "the macros are filled in" (dat moment staat niet op de foto) maar wat
// de app zelf op dat scherm zet, en de zin in scherm 3 is letterlijk wat er in de chat
// staat. Vervang je een screenshot, lees dan het bijschrift ernaast opnieuw.
//
// @ai-todo: Op scherm 1 en 4 staat de voedingsteller op 0 (eiwit en kcal). De app leidt
// die waarden zelf af uit wat er in de app gelogd is en pikt rechtstreeks weggeschreven
// rijen niet op; op 2026-09-07 uitgezocht. Log een dag in de app en schiet die twee
// opnieuw, dan staat er een gevulde dag.
// @ai-sync: docs/marketing/screenshots.md
const SCREENS: Screen[] = [
  {
    eyebrow: 'Snap it',
    title: 'Logged.',
    body: (
      <>
        Take a picture of your plate. The AI works out the calories and macros. <b>No database digging, no guessing portions.</b>
      </>
    ),
    image: '/screenshots/log.png',
    alt: "Carve's home screen with the day's meals, each with its time and calories.",
  },
  {
    eyebrow: 'Packet in your hand?',
    title: 'Scan it.',
    body: (
      <>
        Point the camera at a barcode, a plate, even a receipt. <b>It reads what is in front of it</b> and fills in the macros.
      </>
    ),
    image: '/screenshots/scan.jpg',
    alt: 'The Carve camera pointed at a drink, with the hint "Point at your meal, a receipt or a barcode".',
  },
  {
    eyebrow: 'Ask anything.',
    title: 'Carve adds it.',
    body: (
      <>
        Type &ldquo;today I trained chest and triceps&rdquo; and it lands in the log. <b>The coach answers from what you logged,</b> not from a generic plan.
      </>
    ),
    image: '/screenshots/coach.png',
    alt: "Chat with Carve: 'Today i trained chest and triceps', saved as a Push workout with chest and triceps filled in.",
  },
  {
    eyebrow: 'Your week at a glance',
    title: 'Nothing gets skipped.',
    body: (
      <>
        Every session you log fills the bars. <b>One look tells you which muscle has been waiting</b> since last week.
      </>
    ),
    image: '/screenshots/week.png',
    alt: 'The Carve health screen: the muscle figure with a progress bar per muscle group beside it.',
  },
];

/** Scrollafstand in schermhoogtes: de landing, daarna per scherm, en de wissel zelf. */
const LANDING = 2.2;
const PER_SCREEN = 1;
const SWAP = 0.4;
const TOTAL = LANDING + SCREENS.length * PER_SCREEN + 0.3;

/** Waar het figuur op het Muscle Groups-scherm staat: hoogte en middelpunt als deel van de schermhoogte. */
const IN_PHONE_H = 0.62;
const IN_PHONE_CY = 0.57;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const step = (t: number) => (t < 0.5 ? 0 : 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Het spierfiguur uit de hero dat bij het scrollen in een iPhone blijkt te
 * staan, waarna die telefoon vast blijft en per scherm van inhoud wisselt.
 *
 * @ai-why: De camera trekt terug: het figuur blijft waar het is, de telefoon
 * verschijnt eromheen en schuift naar zijn kolom. Gekozen op 2026-09-06 boven
 * twee alternatieven uit hetzelfde prototype: het figuur dat naar beneden in
 * een opkomende telefoon zakt, en dezelfde landing met een draai naar de
 * achterkant. De reveal zegt "wat je net aanraakte, was al de app" zonder dat
 * er een zin voor nodig is. Daarna wisselen de schermen met zoom-fade (nieuwe
 * zoomt zachtjes in, oude zakt terug en dimt); een push van rechts zou
 * navigatie suggereren die de app zo niet heeft, en een slide van onder is
 * afgekeurd in de bespreking.
 *
 * @ai-why: Één rAF-handler die inline styles schrijft, geen framer-motion.
 * Telefoon, figuur, tekst en schermen hangen aan dezelfde scrollpositie met
 * gekoppelde formules (de telefoon schaalt om het punt waar het figuur straks
 * staat); dat is in één functie te lezen en in useTransform-ketens niet.
 *
 * @ai-why: De startmaat van het figuur en de eindpositie van de telefoon staan
 * in CSS (svh-eenheden). JS meet die met offset* (transform-vrij) en rekent
 * alleen de transforms uit. Zo klopt de server-render al bij p = 0 en verspringt
 * er niets bij hydratie. `svh` en niet `vh`: op iOS Safari zou de sticky stage
 * anders onder de adresbalk doorlopen en bij elke toolbar-toggle opnieuw meten.
 *
 * @ai-gotcha: `prefers-reduced-motion` maakt van de landing een harde overgang
 * op de helft en laat de schermen alleen nog in opacity wisselen. De scroll
 * stuurt het nog steeds, er loopt nergens een timer behalve de week-demo, en
 * die staat dan uit.
 *
 * @ai-sync: components/carve/muscle-week.ts (weekschema en spierregio's van het figuur)
 * @ai-sync: components/carve/CarveMarketingPage.tsx (de hero erboven, de bewijssectie eronder)
 */
export function PhoneStory() {
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const figRef = useRef<HTMLDivElement>(null);
  const holdingRef = useRef(false);

  const [day, setDay] = useState(0);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAuto = useCallback(() => {
    if (autoTimer.current) {
      clearInterval(autoTimer.current);
      autoTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = setTimeout(() => {
      autoTimer.current = setInterval(() => setDay((d) => (d + 1) % WEEK.length), 1700);
    }, 1200);
    return () => {
      clearTimeout(start);
      stopAuto();
    };
  }, [stopAuto]);

  const pick = useCallback(
    (i: number) => {
      stopAuto();
      setDay(i);
    },
    [stopAuto],
  );

  useEffect(() => {
    const pin = pinRef.current;
    const stage = stageRef.current;
    const phone = phoneRef.current;
    const fig = figRef.current;
    if (!pin || !stage || !phone || !fig) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tween = reduce ? step : easeInOut;
    const tweenOut = reduce ? step : easeOut;

    const q = <T extends HTMLElement>(sel: string) => Array.from(stage.querySelectorAll<T>(sel));
    const week = stage.querySelector<HTMLElement>('[data-week]')!;
    const glow = stage.querySelector<HTMLElement>('[data-glow]')!;
    const col = stage.querySelector<HTMLElement>('[data-col]')!;
    const base = stage.querySelector<HTMLElement>('[data-base]')!;
    const inphone = stage.querySelector<HTMLElement>('[data-inphone]')!;
    const chrome = q<HTMLElement>('[data-chrome]');
    const shots = q<HTMLElement>('[data-shot]');
    const caps = q<HTMLElement>('[data-cap]');
    const dots = q<HTMLElement>('[data-dot]');

    // Startbox van het figuur en eindbox van de telefoon, gemeten zonder transforms.
    let G = { vh: 1, dx: 0, dy: 0, s1: 1 };

    function layout() {
      if (!pin || !stage || !phone || !fig) return;
      const vh = stage.clientHeight;
      const pw = phone.offsetWidth;
      const ph = phone.offsetHeight;
      const phoneCx = phone.offsetLeft + pw / 2;
      const figH0 = fig.offsetHeight;
      const figCx0 = fig.offsetLeft + fig.offsetWidth / 2;
      const figCy0 = fig.offsetTop + figH0 / 2;
      const figH1 = ph * IN_PHONE_H;
      const figCy1 = phone.offsetTop + ph * IN_PHONE_CY;
      G = { vh, dx: phoneCx - figCx0, dy: figCy1 - figCy0, s1: figH1 / figH0 };
      phone.style.transformOrigin = `${pw / 2}px ${ph * IN_PHONE_CY}px`;
      render();
    }

    function render() {
      if (!pin || !phone || !fig) return;
      const u = clamp(-pin.getBoundingClientRect().top / G.vh, 0, TOTAL);
      const p = clamp(u / LANDING, 0, 1);

      // Landing: de camera trekt terug, de telefoon verschijnt om het figuur en drijft naar zijn kolom.
      const t = tween(seg(p, 0.1, 0.72));
      fig.style.transform = `translate(${G.dx * t}px, ${G.dy * t}px) scale(${lerp(1, G.s1, t)})`;
      fig.style.opacity = String(1 - seg(p, 0.96, 1));
      phone.style.transform = `translate(${-G.dx * (1 - t)}px, ${-G.dy * (1 - t)}px) scale(${lerp(1 / G.s1, 1, t)})`;
      phone.style.opacity = String(seg(p, 0.06, 0.5));
      inphone.style.opacity = String(seg(p, 0.96, 1));
      const chromeO = String(seg(p, 0.72, 0.9));
      for (const c of chrome) c.style.opacity = chromeO;
      const weekO = String(1 - seg(p, 0.05, 0.3));
      week.style.opacity = weekO;
      week.style.pointerEvents = p > 0.3 ? 'none' : '';
      glow.style.opacity = String(seg(p, 0.3, 0.8));
      col.style.opacity = String(seg(p, 0.7, 0.95));

      const landed = p > 0.25;
      if (landed !== holdingRef.current) {
        holdingRef.current = landed;
        if (landed) {
          stopAuto();
          setDay(LANDING_DAY);
        }
      }

      // Schermen: laag 0 is het Muscle Groups-scherm, daarna de screenshots.
      // Elke laag heeft een entree k en een exit e (= de entree van de volgende).
      const enter = shots.map((_, i) => seg(u, LANDING + i * PER_SCREEN, LANDING + i * PER_SCREEN + SWAP));
      const layers = [base, ...shots];
      let active = 0;
      layers.forEach((el, i) => {
        const k = i === 0 ? 1 : enter[i - 1];
        const e = i < shots.length ? enter[i] : 0;
        const ki = tweenOut(k);
        const ke = tween(e);
        el.style.opacity = String(i === 0 ? 1 : ki);
        el.style.transform = reduce ? '' : `scale(${lerp(1.1, 1, ki) * lerp(1, 0.93, ke)})`;
        el.style.filter = `brightness(${1 - 0.5 * ke})`;
        if (i > 0 && k > 0.5) active = i;
      });
      caps.forEach((c, i) => {
        const inAt = i === 0 ? LANDING * 0.72 : LANDING + (i - 1) * PER_SCREEN + 0.08;
        const outAt = LANDING + i * PER_SCREEN - 0.06;
        const ki = seg(u, inAt, inAt + 0.28);
        const ko = seg(u, outAt, outAt + 0.2);
        c.style.opacity = String(ki * (1 - ko));
        c.style.transform = reduce ? '' : `translateY(${lerp(18, 0, easeOut(ki)) - lerp(0, 14, ko)}px)`;
      });
      dots.forEach((d, i) => d.classList.toggle('bg-[#D4A843]', i === active));
      dots.forEach((d, i) => d.classList.toggle('w-[22px]', i === active));
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        render();
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', layout);
    // @ai-why: Snap op de schermen zelf, niet op de landing of de rest van de
    // pagina. `proximity` en niet `mandatory`: wie doorscrolt merkt er niets
    // van, wie halverwege een wissel loslaat zakt naar het dichtstbijzijnde
    // scherm in plaats van in een half-vervaagde tussenstand te blijven hangen.
    // Staat op <html> zolang dit verhaal in de pagina zit; de rest van de
    // pagina heeft geen snap-punten en scrolt dus vrij.
    const html = document.documentElement;
    const prevSnap = html.style.scrollSnapType;
    html.style.scrollSnapType = 'y proximity';
    layout();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', layout);
      html.style.scrollSnapType = prevSnap;
    };
  }, [stopAuto]);

  const lit = new Set(WEEK[day].muscles);

  return (
    <div ref={pinRef} className="relative" style={{ height: `${(TOTAL + 1) * 100}svh` }}>
      {/* Snap-punten: het Muscle Groups-scherm na de landing en elk scherm zodra zijn wissel klaar is. */}
      {[LANDING, ...SCREENS.map((_, i) => LANDING + i * PER_SCREEN + SWAP)].map((u) => (
        <div key={u} aria-hidden="true" className="absolute left-0 h-0 w-0 [scroll-snap-align:start]" style={{ top: `${u * 100}svh` }} />
      ))}
      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] overflow-hidden [--fh0:min(74svh,720px)] [--ph:min(60svh,600px)] md:[--ph:min(76svh,700px)] [--pw:calc(var(--ph)*9/19.5)]"
      >
        {/* Weekstrip: de demo uit de hero, vervaagt zodra de landing begint. */}
        <div data-week className="absolute top-[3svh] left-1/2 w-[min(400px,88vw)] -translate-x-1/2 md:top-[72px]">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30">This week</p>
          <div className="grid grid-cols-7 gap-1.5" role="tablist" aria-label="Training week">
            {WEEK.map((d, i) => {
              const active = i === day;
              const rest = d.muscles.length === 0;
              return (
                <button
                  key={d.short}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => pick(i)}
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'mouse') pick(i);
                  }}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-center outline-none transition-colors focus-visible:border-[#D4A843] ${
                    active ? 'border-white/[0.14] bg-white/[0.10]' : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <span className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${active ? 'text-white/50' : 'text-white/25'}`}>{d.short}</span>
                  <span className={`text-[12px] font-semibold ${active ? 'text-white' : rest ? 'text-white/25' : 'text-white/55'}`}>{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gloed achter de telefoon, komt op tijdens de landing. */}
        <div
          data-glow
          aria-hidden="true"
          className="pointer-events-none absolute top-[55svh] left-1/2 h-[70svh] w-[90vw] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 opacity-0 md:top-1/2 md:left-[min(66vw,calc(50vw+300px))]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,.075), rgba(255,255,255,.02) 40%, transparent 68%)' }}
        />

        {/* Tekstkolom: links van de telefoon op desktop, erboven op mobiel. */}
        <div
          data-col
          className="absolute top-0 right-6 left-6 grid h-[24svh] content-center justify-items-center text-center opacity-0 md:right-auto md:left-[max(6vw,calc(50vw-520px))] md:h-[100svh] md:w-[min(34vw,420px)] md:justify-items-start md:text-left"
        >
          <Caption gold eyebrow="That's the app" title="The map you just played with.">
            Front and back. Every workout you log fills it in, so you see what you trained this week <b>and what you keep skipping.</b>
          </Caption>
          {SCREENS.map((s) => (
            <Caption key={s.eyebrow} eyebrow={s.eyebrow} title={s.title}>
              {s.body}
            </Caption>
          ))}
          <div className="col-start-1 row-start-2 mt-9 hidden gap-2 md:flex" aria-hidden="true">
            {[0, ...SCREENS.map((_, i) => i + 1)].map((i) => (
              <i key={i} data-dot className="h-1.5 w-1.5 rounded-full bg-white/[0.18] transition-[width,background-color] duration-300" />
            ))}
          </div>
        </div>

        {/* De telefoon: eindpositie in CSS, de landing-transform komt uit JS. */}
        <div
          ref={phoneRef}
          className="absolute top-[55svh] left-1/2 h-[var(--ph)] w-[var(--pw)] rounded-[calc(var(--pw)*0.16)] bg-[#1c1c1e] p-[calc(var(--pw)*0.012)] opacity-0 shadow-[0_50px_120px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(255,255,255,0.06)] will-change-[transform,opacity] md:top-1/2 md:left-[min(66vw,calc(50vw+300px))]"
          style={{ marginLeft: 'calc(var(--pw) / -2)', marginTop: 'calc(var(--ph) / -2)' }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[calc(var(--pw)*0.15)] bg-[#141416]">
            {/* Laag 0: het Muscle Groups-scherm zoals in de app. */}
            <div data-base className="absolute inset-0 will-change-[transform,filter]">
              <div data-chrome className="absolute top-[3.4%] right-[9%] left-[9%] flex items-center justify-between text-[calc(var(--pw)*0.052)] font-semibold opacity-0">
                <span>17:23</span>
                <span className="h-[calc(var(--pw)*0.038)] w-[calc(var(--pw)*0.078)] rounded-[4px] bg-white" />
              </div>
              <div data-chrome className="absolute top-[21%] right-[8%] bottom-[3%] left-[8%] rounded-[calc(var(--pw)*0.07)] bg-[#1a1a1c] opacity-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
              <div data-chrome className="absolute top-[12.5%] left-[8%] text-[calc(var(--pw)*0.085)] font-bold tracking-[-0.02em] opacity-0">
                Muscle Groups
              </div>
              <div data-chrome className="absolute top-[12.8%] right-[7%] rounded-full bg-white/10 px-[0.9em] py-[0.55em] text-[calc(var(--pw)*0.042)] font-semibold opacity-0">
                &#8635; Back
              </div>
              <div data-inphone aria-hidden="true" className="absolute top-[57%] left-1/2 aspect-[360/1100] h-[62%] -translate-x-1/2 -translate-y-1/2 opacity-0">
                <Figure lit={new Set(WEEK[LANDING_DAY].muscles)} priority={false} />
              </div>
            </div>
            {SCREENS.map((s) => (
              <div key={s.image} data-shot className="absolute inset-0 bg-[#101012] opacity-0 will-change-[transform,opacity,filter]">
                <Image
                  src={s.image}
                  alt={s.alt}
                  fill
                  sizes="(min-width: 768px) 330px, 60vw"
                  className="object-cover object-top"
                />
              </div>
            ))}
            <div aria-hidden="true" className="absolute top-[3.2%] left-1/2 z-20 h-[3.4%] w-[32%] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>

        {/* Het reizende figuur: startbox in CSS, reist met JS naar zijn plek in de telefoon. */}
        <div
          ref={figRef}
          className="absolute top-[calc(54svh-var(--fh0)/2)] left-1/2 z-[5] aspect-[360/1100] h-[var(--fh0)] will-change-transform"
          style={{ marginLeft: 'calc(var(--fh0) * 360 / 1100 / -2)' }}
        >
          <Figure lit={lit} priority />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */

interface CaptionProps {
  eyebrow: string;
  title: React.ReactNode;
  children: React.ReactNode;
  gold?: boolean;
}

function Caption({ eyebrow, title, children, gold }: CaptionProps) {
  return (
    <div data-cap className="col-start-1 row-start-1 opacity-0 will-change-[transform,opacity]">
      <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] md:mb-3 ${gold ? 'text-[#D4A843]' : 'text-white/40'}`}>{eyebrow}</p>
      <h3 className="text-[clamp(24px,6vw,34px)] font-bold leading-[1.02] tracking-[-0.03em] text-balance md:text-[clamp(28px,3.6vw,50px)]">{title}</h3>
      <p className="mt-4 hidden max-w-[40ch] text-[clamp(15px,1.25vw,18px)] leading-normal text-white/55 text-pretty [&_b]:font-semibold [&_b]:text-white md:block">{children}</p>
    </div>
  );
}

interface FigureProps {
  lit: Set<string>;
  priority: boolean;
}

/**
 * De tint is een tweede laag die met dezelfde PNG gemaskerd is (`mask-image`),
 * met `mix-blend-mode: multiply` zodat de schaduwen van de tekening blijven.
 * Alternatief was de spiergroepen als losse afbeeldingen exporteren, zoals de
 * iOS-app doet; dat zijn zeven extra assets voor één pagina en de tekening
 * verandert zelden.
 */
function Figure({ lit, priority }: FigureProps) {
  return (
    <>
      <Image
        src={FIGURE_SRC}
        alt="Illustrated muscle map of a body, front view, as shown in Carve. The muscles of the selected training day are highlighted."
        width={FIGURE_WIDTH}
        height={FIGURE_HEIGHT}
        priority={priority}
        sizes="300px"
        className="h-full w-full object-contain"
        style={{ filter: 'drop-shadow(0 30px 60px rgba(0,0,0,.6))' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{
          WebkitMaskImage: `url(${FIGURE_SRC})`,
          maskImage: `url(${FIGURE_SRC})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      >
        <svg viewBox={`0 0 ${FIGURE_WIDTH} ${FIGURE_HEIGHT}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
          <defs>
            <filter id="muscle-soft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="11" />
            </filter>
          </defs>
          <g filter="url(#muscle-soft)" fill="#e2704e">
            {REGIONS.map((r, i) => (
              <ellipse key={i} cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} className="transition-opacity duration-300" style={{ opacity: lit.has(r.m) ? 0.95 : 0 }} />
            ))}
          </g>
        </svg>
      </div>
    </>
  );
}
