'use client'

import { MUSCLES, filledSegments, scoreOf, heatOf, type WeekState } from '@/lib/workout-demo'

interface HypertrophyBarsProps {
  state: WeekState
  className?: string
}

// @ai-why: Tien rijen, vijf blokjes, vaste labelbreedte zodat alle balken links
// uitlijnen. Zonder die vaste breedte begint elke balk op een andere plek en
// leest de kolom als een rommelige lijst in plaats van als een meting — dezelfde
// reden als in HypertrophyBarsColumn in de iOS-app.
//
// @ai-why: Een blokje is oranje zodra de spier vers belast is en wit als hij
// alleen nog telt voor je volume. Zo dragen de balken dezelfde tweedeling als
// het silhouet ernaast: kleur is recency, lengte is volume.
export function HypertrophyBars({ state, className = '' }: HypertrophyBarsProps) {
  return (
    <div className={`flex min-w-0 flex-col justify-center gap-px ${className}`}>
      {MUSCLES.map((muscle) => {
        const filled = filledSegments(scoreOf(muscle, state))
        const fresh = heatOf(muscle, state) > 0.45
        return (
          <div key={muscle.id} className="grid grid-cols-[58px_1fr] items-center gap-2 py-[3px]">
            <span className="truncate text-[11px] text-white/60">{muscle.label}</span>
            <span className="flex gap-[3px]" aria-label={`${muscle.label}: ${filled} van 5`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <i
                  key={i}
                  className={`h-[7px] flex-1 rounded-[2px] transition-[background,box-shadow] duration-500 ${
                    i < filled
                      ? fresh
                        ? 'bg-[#E4783E] shadow-[0_0_9px_rgba(228,120,62,0.55)]'
                        : 'bg-white/[0.82]'
                      : 'bg-white/[0.055]'
                  }`}
                />
              ))}
            </span>
          </div>
        )
      })}
    </div>
  )
}
