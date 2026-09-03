'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  PUSH_DAY, PUSH_DAY_TOTALS, weekBefore, applyGain, weekScore,
  type MuscleId, type WeekState,
} from '@/lib/workout-demo'
import { MuscleMap } from './MuscleMap'
import { HypertrophyBars } from './HypertrophyBars'

// @ai-why: Engelse labels. De site is Engelstalig (zie de homepage en de brief);
// de iOS-app levert en + nl, maar hier praat de coach in de taal van de pagina.
const SHORT: Partial<Record<MuscleId, string>> = { chest: 'chest', shoulders: 'shoulders', triceps: 'triceps' }

// @ai-why: Elke coachregel benoemt iets én verandert het paneel op hetzelfde
// moment. Dat verband is de hele demo: zonder `applies` is dit een chatlog naast
// een plaatje, en dan mist de bezoeker precies waarvoor hij hier is.
interface CoachStep {
  delay: number
  applies: MuscleId[]
  html: string
}

const COACH: CoachStep[] = [
  {
    delay: 1200,
    applies: ['chest'],
    html: '<b>Chest is full.</b> Bench, incline and dips put <span class="demo-up">+12 sets</span> on your chest. That is 14 out of 14 this week, so that bar is maxed.',
  },
  {
    delay: 1400,
    applies: ['triceps', 'shoulders'],
    html: 'Triceps went <span class="demo-up">1 → 5</span> without you planning a day for it. It counts half on bench, overhead and dips, and the pushdown finished it. Shoulders <span class="demo-up">1 → 4</span>.',
  },
  {
    delay: 1400,
    applies: [],
    html: 'Your week went from <b>C to B</b>. That is the sum of the ten bars beside it, nothing else.',
  },
  {
    delay: 1300,
    applies: [],
    html: 'Furthest behind right now: <b>calves</b> and <b>forearms</b>, both at zero this week. Chest stays warm for three days, so Thursday works better as pull or legs than another push.',
  },
]

type Bubble = { id: number; kind: 'user' | 'card' | 'coach' | 'typing'; html?: string }

export function WorkoutsDemo() {
  const [state, setState] = useState<WeekState>(weekBefore)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const timeouts = useRef<NodeJS.Timeout[]>([])
  const streamRef = useRef<HTMLDivElement>(null)

  const run = useCallback(() => {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
    setState(weekBefore())
    setBubbles([])

    let t = 0
    let n = 0
    const at = (ms: number, fn: () => void) => {
      t += ms
      timeouts.current.push(setTimeout(fn, t))
    }

    at(500, () => setBubbles([{ id: ++n, kind: 'user' }]))
    at(700, () => setBubbles((b) => [...b, { id: ++n, kind: 'card' }]))

    for (const step of COACH) {
      at(500, () => setBubbles((b) => [...b, { id: ++n, kind: 'typing' }]))
      at(step.delay, () => {
        setBubbles((b) => [...b.filter((x) => x.kind !== 'typing'), { id: ++n, kind: 'coach', html: step.html }])
        if (step.applies.length) setState((s) => applyGain(s, step.applies))
      })
    }
  }, [])

  useEffect(() => {
    run()
    return () => timeouts.current.forEach(clearTimeout)
  }, [run])

  // @ai-why: Alleen de stroom scrollt, niet de pagina. `scrollIntoView` op het
  // laatste bericht sleepte de hele demo-pagina mee zodra er een regel bij kwam.
  useEffect(() => {
    const el = streamRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [bubbles])

  const { tier } = weekScore(state)

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-6">
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111112] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
          {/* --- gesprek --- */}
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2.5 border-b border-white/[0.05] px-[18px] py-3.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E4783E]" />
              <span className="text-[12.5px] font-semibold text-white/55">Carve</span>
              <span className="ml-auto font-mono text-[10.5px] text-white/20">today 10:04</span>
            </div>

            <div ref={streamRef} className="flex h-[420px] flex-col gap-3 overflow-y-auto px-[18px] py-5 lg:h-[520px]">
              {bubbles.map((b) => {
                if (b.kind === 'user') {
                  return (
                    <div key={b.id} className="carve-msg-in flex justify-end">
                      <span className="max-w-[82%] rounded-[14px] rounded-br-[4px] bg-white/[0.06] px-3.5 py-2.5 text-[13px] text-white/[0.78]">
                        Push Day done
                      </span>
                    </div>
                  )
                }
                if (b.kind === 'card') return <WorkoutCard key={b.id} />
                if (b.kind === 'typing') {
                  return (
                    <div key={b.id} className="carve-msg-in flex gap-1 py-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-[5px] w-[5px] rounded-full bg-[#E4783E]/40"
                          style={{ animation: `typingPulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                        />
                      ))}
                    </div>
                  )
                }
                return (
                  <p
                    key={b.id}
                    className="carve-msg-in demo-coach max-w-[62ch] text-[13.5px] leading-[1.62] text-white/55"
                    dangerouslySetInnerHTML={{ __html: b.html ?? '' }}
                  />
                )
              })}
            </div>

            <div className="border-t border-white/[0.05] px-[18px] py-3.5">
              <div className="flex items-center rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-[13px] text-white/[0.16]">
                Ask anything about your training…
              </div>
            </div>
          </div>

          {/* --- lijf en balken --- */}
          <div className="flex min-w-0 flex-col border-t border-white/[0.06] bg-[#0c0c0d] lg:border-l lg:border-t-0">
            <div className="flex items-center gap-2.5 border-b border-white/[0.05] px-[18px] py-3.5">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/20">This week</span>
              <span className="ml-auto flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] py-1 pl-3 pr-2.5">
                <em className="font-mono text-[9.5px] not-italic uppercase tracking-[0.14em] text-white/20">Week</em>
                <b className="min-w-[15px] text-center text-[16px] font-extrabold text-white">{tier ?? '–'}</b>
              </span>
            </div>
            <div className="grid flex-1 grid-cols-[minmax(0,1fr)_150px] items-center gap-2 px-4 pb-[18px] pt-3.5">
              <MuscleMap state={state} className="max-w-[150px]" />
              <HypertrophyBars state={state} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/[0.05] bg-[#0e0e0f] px-[18px] py-3.5">
          <button
            onClick={run}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[12px] font-semibold text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            ↻ Replay
          </button>
          <span className="ml-auto font-mono text-[10.5px] text-white/20">demo data · none of this is yours</span>
        </div>
      </div>
    </div>
  )
}

function WorkoutCard() {
  return (
    <div className="carve-msg-in overflow-hidden rounded-[13px] border border-white/[0.08] bg-[#161617]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.05] px-3.5 py-3 text-[13.5px] font-semibold">
        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#E4783E] text-[10.5px] font-extrabold text-[#0A0A0B]">
          ✓
        </span>
        Push Day
        <span className="ml-auto font-mono text-[11px] font-normal text-white/20">
          {PUSH_DAY_TOTALS.sets} sets · {PUSH_DAY_TOTALS.duration}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 px-3.5 py-3">
        {PUSH_DAY.map((ex) => (
          <div key={ex.name} className="flex items-baseline gap-2.5 text-[12.5px] text-white/55">
            <b className="font-semibold text-white">{ex.name}</b>
            {ex.sets} × {ex.reps}
            {/* @ai-why: De spieren staan hier en niet alleen in de coachtekst.
                "½ triceps" is de secundaire regel uit WorkoutMuscleResolver, en het
                is de uitleg waarom triceps straks vol staat zonder eigen oefening. */}
            <span className="ml-auto shrink-0 font-mono text-[10.5px] text-white/20">
              {ex.secondary ? `${SHORT[ex.primary]} · ½ ${SHORT[ex.secondary]}` : SHORT[ex.primary]}
            </span>
            <span className="w-[92px] shrink-0 text-right font-mono text-[11px] text-white/25">{ex.load}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
