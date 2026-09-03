// @ai-context: Het model achter de voedingsdemo op /demo?d=food. Net als bij
// workouts komen de regels uit de iOS-app en niet uit de duim.
//
// @ai-sync: Carve AI/App/Models/NutritionGoals.swift (afleiding van de macro's)
// @ai-sync: docs/decisions/ADR-008-een-camera-beeld-bepaalt-route.md (barcode versus foto)

export type LogMethod = 'barcode' | 'photo' | 'chat'

export interface FoodItem {
  name: string
  amount: string
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface Meal {
  id: string
  label: string
  time: string
  method: LogMethod
  /** Wat de app aan de invoer overhield: het gescande product, of wat vision zag. */
  source: string
  items: readonly FoodItem[]
  /** Eén korte regel van de coach. */
  note: string
}

export interface MacroTarget {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

// @ai-gotcha: P·4 + K·4 + V·9 moet exact op `kcal` uitkomen. In de app is precies
// dat twee keer misgegaan: de kcal waren doel-bewust en de grammen bleven op een
// default staan, met een comment erboven die "single source of truth" beweerde.
// 160·4 + 320·4 + 80·9 = 640 + 1280 + 720 = 2640. Verander je één getal, reken de
// rest dan mee.
export const TARGET: MacroTarget = { kcal: 2640, protein: 160, carbs: 320, fat: 80 }

export const DAY: readonly Meal[] = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    time: '08:10',
    method: 'barcode',
    source: 'Scanned · AH Skyr naturel',
    note: 'Skyr scanned, oats and banana from your usual.',
    items: [
      { name: 'Skyr, plain',  amount: '300 g', kcal: 193, protein: 34, carbs: 12, fat: 1 },
      { name: 'Oats',         amount: '80 g',  kcal: 298, protein: 11, carbs: 50, fat: 6 },
      { name: 'Banana',       amount: '120 g', kcal: 108, protein: 1,  carbs: 26, fat: 0 },
    ],
  },
  {
    id: 'lunch',
    label: 'Lunch',
    time: '13:05',
    method: 'photo',
    source: 'Photo · chicken, rice, broccoli',
    note: 'One photo, four items. Portions estimated from the plate.',
    items: [
      { name: 'Chicken breast', amount: '200 g', kcal: 311, protein: 62, carbs: 0,  fat: 7 },
      { name: 'White rice',     amount: '250 g', kcal: 317, protein: 6,  carbs: 71, fat: 1 },
      { name: 'Broccoli',       amount: '150 g', kcal: 53,  protein: 4,  carbs: 7,  fat: 1 },
      { name: 'Olive oil',      amount: '10 g',  kcal: 90,  protein: 0,  carbs: 0,  fat: 10 },
    ],
  },
  {
    id: 'snack',
    label: 'Snack',
    time: '16:20',
    method: 'barcode',
    source: 'Scanned · protein bar',
    note: 'Scanned in two seconds.',
    items: [
      { name: 'Protein bar', amount: '55 g', kcal: 205, protein: 20, carbs: 20, fat: 5 },
    ],
  },
]

export function mealTotals(meal: Meal): MacroTarget {
  return meal.items.reduce<MacroTarget>(
    (t, i) => ({ kcal: t.kcal + i.kcal, protein: t.protein + i.protein, carbs: t.carbs + i.carbs, fat: t.fat + i.fat }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

export function totalsUpTo(count: number): MacroTarget {
  return DAY.slice(0, count).reduce<MacroTarget>(
    (t, m) => {
      const s = mealTotals(m)
      return { kcal: t.kcal + s.kcal, protein: t.protein + s.protein, carbs: t.carbs + s.carbs, fat: t.fat + s.fat }
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

export function remaining(eaten: MacroTarget): MacroTarget {
  return {
    kcal: TARGET.kcal - eaten.kcal,
    protein: TARGET.protein - eaten.protein,
    carbs: TARGET.carbs - eaten.carbs,
    fat: TARGET.fat - eaten.fat,
  }
}

/** Wat er na de laatste maaltijd overblijft, uitgerekend en niet overgetypt. */
export const LEFT_FOR_DINNER = remaining(totalsUpTo(DAY.length))
