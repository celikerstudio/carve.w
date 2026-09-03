'use client'

import { DAY, TARGET, mealTotals, totalsUpTo, remaining } from '@/lib/food-demo'

const ACCENT = '#22c55e'

interface NutritionPanelProps {
  /** Hoeveel maaltijden er tot nu toe gelogd zijn. */
  logged: number
}

// @ai-why: Vier meters en niet één ring. De vraag die de bezoeker heeft is niet
// "hoeveel calorieën" maar "waar zit ik nog krap", en dat zie je pas als eiwit,
// koolhydraten en vet los naast elkaar staan. In de app is dat dezelfde
// tweedeling: kcal is de kop, de macro's dragen het oordeel.
export function NutritionPanel({ logged }: NutritionPanelProps) {
  const eaten = totalsUpTo(logged)
  const left = remaining(eaten)

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pb-[18px] pt-4">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[26px] font-semibold tabular-nums tracking-tight text-white">
            {eaten.kcal.toLocaleString('en-US')}
          </span>
          <span className="font-mono text-[12px] tabular-nums text-white/30">
            / {TARGET.kcal.toLocaleString('en-US')} kcal
          </span>
          <span className="ml-auto font-mono text-[11px] tabular-nums text-white/40">
            {left.kcal.toLocaleString('en-US')} left
          </span>
        </div>
        <Meter value={eaten.kcal} target={TARGET.kcal} tall />
      </div>

      <div className="flex flex-col gap-2.5">
        <MacroRow label="Protein" value={eaten.protein} target={TARGET.protein} />
        <MacroRow label="Carbs" value={eaten.carbs} target={TARGET.carbs} />
        <MacroRow label="Fat" value={eaten.fat} target={TARGET.fat} />
      </div>

      <div className="mt-1 flex flex-col gap-px border-t border-white/[0.05] pt-3">
        {DAY.map((meal, i) => {
          const done = i < logged
          const totals = mealTotals(meal)
          return (
            <div
              key={meal.id}
              className={`flex items-baseline gap-2 py-[5px] transition-opacity duration-500 ${done ? 'opacity-100' : 'opacity-25'}`}
            >
              <span className="text-[12px] text-white/60">{meal.label}</span>
              <span className="font-mono text-[10px] text-white/20">{done ? meal.time : '—'}</span>
              <span className="ml-auto font-mono text-[11px] tabular-nums text-white/45">
                {done ? `${totals.kcal} kcal` : ''}
              </span>
            </div>
          )
        })}
        <div className="flex items-baseline gap-2 py-[5px]">
          <span className="text-[12px] text-white/60">Dinner</span>
          <span className="font-mono text-[10px] text-white/20">open</span>
          <span className="ml-auto font-mono text-[11px] tabular-nums" style={{ color: ACCENT }}>
            {logged === DAY.length ? `${left.kcal.toLocaleString('en-US')} kcal room` : ''}
          </span>
        </div>
      </div>
    </div>
  )
}

function MacroRow({ label, value, target }: { label: string; value: number; target: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <span className="text-[11.5px] text-white/55">{label}</span>
        <span className="ml-auto font-mono text-[11px] tabular-nums text-white/45">
          {value} <span className="text-white/20">/ {target} g</span>
        </span>
      </div>
      <Meter value={value} target={target} />
    </div>
  )
}

// @ai-why: De meter loopt nooit voorbij 100% maar kleurt wél anders zodra je erover
// gaat. Een balk die doorschiet leest als "goed bezig" terwijl te veel vet net zo
// goed een signaal is als te weinig eiwit.
function Meter({ value, target, tall = false }: { value: number; target: number; tall?: boolean }) {
  const pct = Math.min(100, (value / target) * 100)
  const over = value > target
  return (
    <div className={`mt-1.5 w-full overflow-hidden rounded-full bg-white/[0.06] ${tall ? 'h-[5px]' : 'h-[3px]'}`}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%`, background: over ? '#E4783E' : ACCENT }}
      />
    </div>
  )
}
