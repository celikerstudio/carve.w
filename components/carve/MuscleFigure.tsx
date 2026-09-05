'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type MuscleKey = 'shoulders' | 'chest' | 'biceps' | 'forearms' | 'abs' | 'legs' | 'calves';

interface Day {
  short: string;
  label: string;
  /** Spiergroepen die deze dag oplichten; leeg is een rustdag. */
  muscles: MuscleKey[];
}

// @ai-context: Het weekschema uit de app (Push / Pull / Legs / Rest / Upper /
// Lower / Rest), dezelfde week als op de goal-screenshot in de App Store-set.
// Het figuur toont de voorkant, dus "pull" licht biceps en onderarmen op en
// niet de rug.
const WEEK: Day[] = [
  { short: 'Mon', label: 'Push', muscles: ['chest', 'shoulders'] },
  { short: 'Tue', label: 'Pull', muscles: ['biceps', 'forearms'] },
  { short: 'Wed', label: 'Legs', muscles: ['legs', 'calves'] },
  { short: 'Thu', label: 'Rest', muscles: [] },
  { short: 'Fri', label: 'Upper', muscles: ['chest', 'shoulders', 'biceps', 'abs'] },
  { short: 'Sat', label: 'Lower', muscles: ['legs', 'calves'] },
  { short: 'Sun', label: 'Rest', muscles: [] },
];

// Ellipsen in de 360×1100-ruimte van public/muscle-front.png. Handmatig op het
// figuur gelegd; de tint wordt door de PNG zelf gemaskerd, dus een ellips die
// iets over de rand valt is niet zichtbaar.
const REGIONS: Array<{ m: MuscleKey; cx: number; cy: number; rx: number; ry: number }> = [
  { m: 'shoulders', cx: 68, cy: 232, rx: 40, ry: 44 }, { m: 'shoulders', cx: 292, cy: 232, rx: 40, ry: 44 },
  { m: 'chest', cx: 132, cy: 278, rx: 52, ry: 44 }, { m: 'chest', cx: 228, cy: 278, rx: 52, ry: 44 },
  { m: 'biceps', cx: 50, cy: 345, rx: 30, ry: 62 }, { m: 'biceps', cx: 310, cy: 345, rx: 30, ry: 62 },
  { m: 'forearms', cx: 34, cy: 478, rx: 26, ry: 72 }, { m: 'forearms', cx: 326, cy: 478, rx: 26, ry: 72 },
  { m: 'abs', cx: 180, cy: 400, rx: 48, ry: 84 },
  { m: 'legs', cx: 128, cy: 785, rx: 44, ry: 95 }, { m: 'legs', cx: 232, cy: 785, rx: 44, ry: 95 },
  { m: 'calves', cx: 116, cy: 955, rx: 30, ry: 75 }, { m: 'calves', cx: 244, cy: 955, rx: 30, ry: 75 },
];

const FIGURE_SRC = '/muscle-front.png';

/**
 * Het spierfiguur in de hero, gestuurd door het weekschema.
 *
 * @ai-why: De week-strip is de strip van het goal-scherm in de app. Tik een dag
 * aan en de spieren van die dag lichten op; een rustdag laat het figuur leeg.
 * Dat legt in één beweging uit wat de app doet (een schema dat je spieren
 * bijhoudt) zonder tekst. Tot de bezoeker iets aanraakt loopt de demo zelf
 * door de week. Een eerdere versie liet je losse spieren aantikken met een
 * hypertrofiebalk erbij; dat vroeg de bezoeker om zelf te bedenken wat hij
 * moest doen, dit niet.
 *
 * @ai-why: De tint is een tweede laag die met dezelfde PNG gemaskerd is
 * (`mask-image`), met `mix-blend-mode: multiply` zodat de schaduwen van de
 * tekening blijven. Alternatief was de spiergroepen als losse afbeeldingen
 * exporteren, zoals de iOS-app doet; dat zijn zeven extra assets voor één
 * pagina en de tekening verandert zelden.
 */
export function MuscleFigure() {
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

  const lit = new Set(WEEK[day].muscles);

  return (
    <>
      <div className="mt-10 w-full max-w-[400px]">
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
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') pick(i); }}
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

      <div className="relative mt-6 w-[min(70vw,260px)] md:w-[min(72vw,300px)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-6%] left-1/2 h-[40%] w-[160%] -translate-x-1/2"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,.07), transparent 65%)' }}
        />
        <Image
          src={FIGURE_SRC}
          alt="Illustrated muscle map of a body, front view, as shown in Carve. The muscles of the selected training day are highlighted."
          width={360}
          height={1100}
          priority
          className="relative h-auto w-full"
          style={{ filter: 'drop-shadow(0 30px 60px rgba(0,0,0,.6))' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-multiply"
          style={{ WebkitMaskImage: `url(${FIGURE_SRC})`, maskImage: `url(${FIGURE_SRC})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}
        >
          <svg viewBox="0 0 360 1100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <defs>
              <filter id="muscle-soft" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="11" />
              </filter>
            </defs>
            <g filter="url(#muscle-soft)" fill="#e2704e">
              {REGIONS.map((r, i) => (
                <ellipse
                  key={i}
                  cx={r.cx}
                  cy={r.cy}
                  rx={r.rx}
                  ry={r.ry}
                  className="transition-opacity duration-300"
                  style={{ opacity: lit.has(r.m) ? 0.95 : 0 }}
                />
              ))}
            </g>
          </svg>
        </div>
      </div>
    </>
  );
}
