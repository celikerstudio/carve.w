'use client'

import { MUSCLES, MUSCLE_BLOBS, heatOf, heatColor, type WeekState } from '@/lib/workout-demo'

const FIG = '/muscle-front.png'

// @ai-why: Vier lagen, zoals de app de kaart opbouwt (ADR-010). De halo is
// ongemaskerd en breed; de andere drie zijn met de figuur zelf gemaskerd zodat de
// tint op het lichaam blijft en niet de achtergrond kleurt.
//
// @ai-gotcha: De halo staat op 35% en niet hoger. Op 80 loopt de warmte over de
// spiergrens: bij een beendag kleuren knieën en schenen mee, en dan is de kaart
// niet meer te vertrouwen als kiezer. Dat staat zo in ADR-010 en is daar gemeten,
// niet gevoeld.
const LAYERS = [
  { key: 'halo',  cls: 'blur-[13px] opacity-35',              grow: 1.5,  masked: false, lighten: false },
  { key: 'depth', cls: 'mix-blend-multiply opacity-80',       grow: 0.95, masked: true,  lighten: false },
  { key: 'tint',  cls: 'mix-blend-color',                     grow: 0.95, masked: true,  lighten: false },
  { key: 'lift',  cls: 'mix-blend-plus-lighter opacity-50',   grow: 0.55, masked: true,  lighten: true  },
] as const

interface MuscleMapProps {
  state: WeekState
  /** Alleen deze spier op volle sterkte, de rest gedimd. */
  spotlight?: string | null
  className?: string
}

export function MuscleMap({ state, spotlight = null, className = '' }: MuscleMapProps) {
  const maskStyle = {
    WebkitMaskImage: `url(${FIG})`,
    maskImage: `url(${FIG})`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  } as const

  return (
    // @ai-why: `isolate` is niet optioneel. Zonder eigen stacking context mengen
    // de blend-lagen met de pagina achter de figuur in plaats van met de figuur.
    <div className={`relative isolate mx-auto w-full ${className}`}>
      <div className="pt-[281.25%]" />
      {/* eslint-disable-next-line @next/next/no-img-element -- het masker hieronder
          moet exact hetzelfde bestand adresseren; next/image herschrijft de URL. */}
      <img
        src={FIG}
        alt="Voorkant van het spiersilhouet, met de getrainde spieren warm gekleurd"
        className="absolute inset-0 h-full w-full object-contain saturate-[.15] brightness-[.92]"
      />

      {LAYERS.map((layer) => (
        <div
          key={layer.key}
          aria-hidden
          className={`pointer-events-none absolute inset-0 h-full w-full ${layer.cls}`}
          style={layer.masked ? maskStyle : undefined}
        >
          {MUSCLES.map((muscle) => {
            let heat = heatOf(muscle, state)
            if (heat <= 0.02) return null
            if (spotlight && muscle.id !== spotlight) heat *= 0.28
            const [r, g, b] = heatColor(heat)
            const alpha = layer.lighten ? heat * 0.5 : 0.35 + 0.65 * heat
            return MUSCLE_BLOBS[muscle.id].map((p, i) => (
              <div
                key={`${muscle.id}-${i}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-[background,opacity] duration-700 ease-out"
                style={{
                  left: `${p.cx * 100}%`,
                  top: `${p.cy * 100}%`,
                  width: `${p.rx * 2 * layer.grow * 100}%`,
                  height: `${p.ry * 2 * layer.grow * 100}%`,
                  background: `radial-gradient(closest-side, rgba(${r},${g},${b},${alpha}) 0%, rgba(${r},${g},${b},0) 72%)`,
                }}
              />
            ))
          })}
        </div>
      ))}
    </div>
  )
}
