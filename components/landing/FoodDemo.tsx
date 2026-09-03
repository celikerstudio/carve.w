'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ScanBarcode, Camera, MessageSquareText } from 'lucide-react'
import { DAY, LEFT_FOR_DINNER, mealTotals, type LogMethod, type Meal } from '@/lib/food-demo'
import { NutritionPanel } from './NutritionPanel'

// @ai-why: Het icoon zegt hoe de maaltijd binnenkwam. Dat is het hele punt van deze
// demo: drie ingangen, één dagboek. ADR-008 legt vast dat de camera zelf beslist of
// het een barcode of een bord eten is, dus barcode en foto zijn niet twee knoppen
// maar twee uitkomsten van dezelfde handeling.
const METHOD: Record<LogMethod, { icon: typeof ScanBarcode; label: string }> = {
  barcode: { icon: ScanBarcode, label: 'barcode' },
  photo: { icon: Camera, label: 'photo' },
  chat: { icon: MessageSquareText, label: 'chat' },
}

type Bubble =
  | { key: string; kind: 'ask'; text: string }
  | { key: string; kind: 'meal'; meal: Meal }
  | { key: string; kind: 'note'; text: string }
  | { key: string; kind: 'close'; text: string }

const CLOSING =
  `<b>${LEFT_FOR_DINNER.kcal.toLocaleString('en-US')} kcal left</b> for dinner, and you still need ` +
  `<b>${LEFT_FOR_DINNER.protein} g protein</b>. Salmon, potatoes and greens covers it.`

export function FoodDemo() {
  const [logged, setLogged] = useState(0)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const timeouts = useRef<NodeJS.Timeout[]>([])
  const streamRef = useRef<HTMLDivElement>(null)

  const run = useCallback(() => {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
    setLogged(0)
    setBubbles([])

    let t = 0
    const at = (ms: number, fn: () => void) => {
      t += ms
      timeouts.current.push(setTimeout(fn, t))
    }

    at(400, () => setBubbles([{ key: 'ask', kind: 'ask', text: 'What should I eat tonight?' }]))
    DAY.forEach((meal, i) => {
      at(900, () => {
        setLogged(i + 1)
        setBubbles((b) => [...b, { key: `m-${meal.id}`, kind: 'meal', meal }])
      })
      at(850, () => setBubbles((b) => [...b, { key: `n-${meal.id}`, kind: 'note', text: meal.note }]))
    })
    at(1000, () => setBubbles((b) => [...b, { key: 'close', kind: 'close', text: CLOSING }]))
  }, [])

  useEffect(() => {
    run()
    return () => timeouts.current.forEach(clearTimeout)
  }, [run])

  useEffect(() => {
    const el = streamRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [bubbles])

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-6">
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111112] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2.5 border-b border-white/[0.05] px-[18px] py-3.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              <span className="text-[12.5px] font-semibold text-white/55">Carve</span>
              <span className="ml-auto font-mono text-[10.5px] text-white/20">today</span>
            </div>

            {/* @ai-gotcha: `shrink-0` op elk kind. De stroom heeft een vaste hoogte, dus
                zonder dat krimpen de flex-items en snijdt `overflow-hidden` op de kaart
                de helft van een maaltijd weg — zonder foutmelding. */}
            <div ref={streamRef} className="flex h-[440px] flex-col gap-3 overflow-y-auto px-[18px] py-5 lg:h-[540px]">
              {bubbles.map((b) => {
                if (b.kind === 'ask') {
                  return (
                    <div key={b.key} className="carve-msg-in flex shrink-0 justify-end">
                      <span className="max-w-[82%] rounded-[14px] rounded-br-[4px] bg-white/[0.06] px-3.5 py-2.5 text-[13px] text-white/[0.78]">
                        {b.text}
                      </span>
                    </div>
                  )
                }
                if (b.kind === 'meal') return <MealCard key={b.key} meal={b.meal} />
                if (b.kind === 'note') {
                  return (
                    <p key={b.key} className="carve-msg-in max-w-[54ch] shrink-0 text-[13.5px] leading-[1.6] text-white/55">
                      {b.text}
                    </p>
                  )
                }
                return (
                  <p
                    key={b.key}
                    className="carve-msg-in demo-coach max-w-[54ch] shrink-0 border-l-2 border-[#22c55e]/50 pl-3 text-[13.5px] leading-[1.6] text-white/55"
                    dangerouslySetInnerHTML={{ __html: b.text }}
                  />
                )
              })}
            </div>

            <div className="border-t border-white/[0.05] px-[18px] py-3.5">
              <div className="flex items-center rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-[13px] text-white/[0.16]">
                Scan, snap a photo, or just type it…
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col border-t border-white/[0.06] bg-[#0c0c0d] lg:border-l lg:border-t-0">
            <div className="flex items-center gap-2.5 border-b border-white/[0.05] px-[18px] py-3.5">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/20">Today</span>
            </div>
            <NutritionPanel logged={logged} />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/[0.05] bg-[#0e0e0f] px-[18px] py-3.5">
          <button
            onClick={run}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[12px] font-semibold text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            ↻ Replay the day
          </button>
          <span className="ml-auto font-mono text-[10.5px] text-white/20">demo data · none of this is yours</span>
        </div>
      </div>
    </div>
  )
}

function MealCard({ meal }: { meal: Meal }) {
  const totals = mealTotals(meal)
  const { icon: Icon, label } = METHOD[meal.method]
  return (
    <div className="carve-msg-in shrink-0 overflow-hidden rounded-[13px] border border-white/[0.08] bg-[#161617]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.05] px-3.5 py-3">
        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-[#0A0A0B]">
          <Icon className="h-[11px] w-[11px]" strokeWidth={2.4} />
        </span>
        <span className="text-[13.5px] font-semibold">{meal.label}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">{label}</span>
        <span className="ml-auto font-mono text-[11px] text-white/20">
          {totals.kcal} kcal · {meal.time}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 px-3.5 py-3">
        {meal.items.map((item) => (
          <div key={item.name} className="flex items-baseline gap-2.5 text-[12.5px] text-white/55">
            <b className="font-semibold text-white">{item.name}</b>
            <span className="font-mono text-[11px] text-white/25">{item.amount}</span>
            <span className="ml-auto shrink-0 font-mono text-[10.5px] text-white/20">
              {item.protein}p · {item.carbs}c · {item.fat}f
            </span>
            <span className="w-[58px] shrink-0 text-right font-mono text-[11px] tabular-nums text-white/35">
              {item.kcal} kcal
            </span>
          </div>
        ))}
      </div>
      {/* @ai-why: De bron staat er als voetregel en niet als tooltip. "Scanned · AH
          Skyr naturel" is het bewijs dat de app het product hérkende en niet dat jij
          drie velden hebt ingevuld. */}
      <div className="border-t border-white/[0.05] px-3.5 py-2 font-mono text-[10px] text-white/20">
        {meal.source}
      </div>
    </div>
  )
}
