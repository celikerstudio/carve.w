// @ai-context: Het rekenmodel achter de workouts-demo op /demo?d=workouts. Alle
// constanten komen uit de iOS-app (~/Developer/Carve-AI) en zijn hier bewust
// gekopieerd in plaats van benaderd: een demo die andere getallen laat zien dan
// het product verkoopt iets dat niet bestaat, en dat is precies de drift die
// TDR-0001 opruimt.
//
// @ai-sync: Carve AI/App/Models/MuscleGroupID.swift (weeklySetTarget, recoveryWindowDays)
// @ai-sync: Carve AI/App/Services/Workout/HypertrophyProgressionService.swift (filledSegments)
// @ai-sync: Carve AI/App/Models/WeekScore.swift (Tier.lowerBoundPercentage)
// @ai-sync: Carve AI/App/Models/MuscleHeat.swift (kleurramp)

export type MuscleId =
  | 'shoulders' | 'chest' | 'biceps' | 'triceps' | 'back'
  | 'core' | 'forearms' | 'glutes' | 'legs' | 'calves'

export interface MuscleDef {
  id: MuscleId
  label: string
  /** Sets per week waarbij de balk vol staat. */
  weeklyTarget: number
  /** Dagen van "net belast" terug naar "klaar". Voedt de warmte op de kaart. */
  recoveryDays: number
}

// @ai-why: Volgorde is `MuscleGroupID.readingOrder` — van kruin naar voeten,
// in de app berekend uit de zwaartepunten van de zonekaart. Hier uitgeschreven
// omdat we die zonekaart niet meenemen naar het web.
export const MUSCLES: readonly MuscleDef[] = [
  { id: 'shoulders', label: 'Shoulders', weeklyTarget: 12, recoveryDays: 3 },
  { id: 'chest',     label: 'Chest',     weeklyTarget: 14, recoveryDays: 3 },
  { id: 'biceps',    label: 'Biceps',    weeklyTarget: 8,  recoveryDays: 2 },
  { id: 'triceps',   label: 'Triceps',   weeklyTarget: 8,  recoveryDays: 2 },
  { id: 'back',      label: 'Back',      weeklyTarget: 18, recoveryDays: 3 },
  { id: 'core',      label: 'Core',      weeklyTarget: 10, recoveryDays: 2 },
  { id: 'forearms',  label: 'Forearms',  weeklyTarget: 6,  recoveryDays: 2 },
  { id: 'glutes',    label: 'Glutes',    weeklyTarget: 10, recoveryDays: 4 },
  { id: 'legs',      label: 'Legs',      weeklyTarget: 20, recoveryDays: 4 },
  { id: 'calves',    label: 'Calves',    weeklyTarget: 8,  recoveryDays: 2 },
]

export interface Blob { cx: number; cy: number; rx: number; ry: number }

// @ai-why: Zwaartepunten per lichaamshelft, gedecodeerd uit
// `Carve AI/Resources/muscle_zones.json` (front_male, 128×256 RLE) en omgerekend
// naar het kader van public/muscle-front.png. De zonekaart en de figuur bleken
// dezelfde verhouding te hebben (1:3.06 tegen 1:3.08), dus de gloed staat waar
// de app hem zet. Glutes staan niet op de voorkant en hebben dus geen vlek.
//
// @ai-gotcha: Deze getallen horen bij precies dat plaatje. Vervang je de
// uitsnede, dan moeten ze opnieuw berekend worden uit de zonekaart.
export const MUSCLE_BLOBS: Record<MuscleId, Blob[]> = {
  chest:     [{ cx: .486, cy: .234, rx: .256, ry: .138 }],
  shoulders: [{ cx: .212, cy: .223, rx: .112, ry: .056 }, { cx: .758, cy: .221, rx: .125, ry: .058 }],
  back:      [{ cx: .292, cy: .381, rx: .137, ry: .121 }, { cx: .686, cy: .382, rx: .137, ry: .121 }],
  biceps:    [{ cx: .198, cy: .315, rx: .050, ry: .060 }, { cx: .783, cy: .317, rx: .050, ry: .060 }],
  triceps:   [{ cx: .115, cy: .351, rx: .044, ry: .060 }, { cx: .869, cy: .352, rx: .050, ry: .067 }],
  core:      [{ cx: .488, cy: .419, rx: .175, ry: .118 }],
  forearms:  [{ cx: .126, cy: .467, rx: .075, ry: .112 }, { cx: .858, cy: .468, rx: .075, ry: .109 }],
  legs:      [{ cx: .320, cy: .596, rx: .175, ry: .112 }, { cx: .663, cy: .597, rx: .175, ry: .112 }],
  calves:    [{ cx: .266, cy: .832, rx: .131, ry: .134 }, { cx: .723, cy: .832, rx: .131, ry: .134 }],
  glutes:    [],
}

/** Sets per spier, en hoeveel dagen geleden die spier voor het laatst geraakt is. */
export interface WeekState {
  sets: Record<MuscleId, number>
  daysAgo: Record<MuscleId, number>
}

// @ai-why: `min(5, max(1, ceil(score * 5)))` — één op één HypertrophyProgressionService.
// Elke score boven nul geeft minstens één blokje; dat is met opzet, anders is
// "ik heb er iets aan gedaan" niet te onderscheiden van "niets".
export function filledSegments(score: number): number {
  const clamped = Math.min(Math.max(score, 0), 1)
  if (clamped <= 0) return 0
  return Math.min(5, Math.max(1, Math.ceil(clamped * 5)))
}

// @ai-why: Vol gewicht t/m dag 7, daarna lineair uitdovend naar nul op dag 14
// (ADR-014). Een harde vensterrand was een klif: je stond op nul terwijl er aan
// je borst niets veranderd was.
export function volumeDecay(daysAgo: number): number {
  if (daysAgo <= 7) return 1
  if (daysAgo >= 14) return 0
  return 1 - (daysAgo - 7) / 7
}

export function scoreOf(muscle: MuscleDef, state: WeekState): number {
  const sets = state.sets[muscle.id] ?? 0
  return Math.min(1, (sets * volumeDecay(state.daysAgo[muscle.id] ?? 99)) / muscle.weeklyTarget)
}

// @ai-why: Warmte is niet hetzelfde als score. De balk gaat over volume in een
// week, de kleur over "hoe recent belast". Daarom een eigen venster per spier,
// met een staart zodat de tint niet op de dag van herstel abrupt uitgaat.
export function heatOf(muscle: MuscleDef, state: WeekState): number {
  const d = state.daysAgo[muscle.id] ?? 99
  const window = muscle.recoveryDays + 1.5
  if (d >= window) return 0
  return Math.max(0, 1 - d / window)
}

// @ai-why: Eenzijdige schaal uit MuscleHeat. Alleen wat je recent belast hebt
// krijgt warmte; een herstelde spier is gewoon een spier. Geen groen: dat is een
// UI-conventie die op spierweefsel geplakt was.
export function heatColor(heat: number): [number, number, number] {
  const t = Math.pow(Math.min(Math.max(heat, 0), 1), 1.5)
  return [
    Math.round(182 + (228 - 182) * t),
    Math.round(60 + (120 - 60) * t),
    Math.round(36 + (62 - 36) * t),
  ]
}

export type Tier = 'A' | 'B' | 'C' | 'D' | null

// @ai-why: Letters en geen percentage (ADR-026). Geijkt op echte data: de hoogste
// weekscore ooit gemeten is 52%, dus een ladder vanaf 80% zou A en B leeg laten.
// @ai-gotcha: `null` betekent "te weinig voor een letter", niet "onbekend".
export function tierOf(percentage: number): Tier {
  if (percentage >= 50) return 'A'
  if (percentage >= 36) return 'B'
  if (percentage >= 24) return 'C'
  if (percentage >= 10) return 'D'
  return null
}

/** Som van de tien balken (0…50) als percentage, plus de letter. */
export function weekScore(state: WeekState): { total: number; percentage: number; tier: Tier } {
  const total = MUSCLES.reduce((sum, m) => sum + filledSegments(scoreOf(m, state)), 0)
  const percentage = Math.round((total * 100) / 50)
  return { total, percentage, tier: tierOf(percentage) }
}

// ---------------------------------------------------------------------------
// De sessie in de demo
// ---------------------------------------------------------------------------

export interface DemoExercise {
  name: string
  /** Weergavetekst voor de belasting. */
  load: string
  sets: number
  reps: number
  primary: MuscleId
  /** Telt voor de helft mee, zoals WorkoutMuscleResolver het doet. */
  secondary: MuscleId | null
}

export const PUSH_DAY: readonly DemoExercise[] = [
  { name: 'Bench press',      load: '80 kg',           sets: 4, reps: 8,  primary: 'chest',     secondary: 'triceps' },
  { name: 'Incline dumbbell', load: '28 kg',           sets: 4, reps: 10, primary: 'chest',     secondary: 'shoulders' },
  { name: 'Overhead press',   load: '45 kg',           sets: 4, reps: 8,  primary: 'shoulders', secondary: 'triceps' },
  { name: 'Dips',             load: 'bodyweight'    , sets: 4, reps: 10, primary: 'chest',     secondary: 'triceps' },
  { name: 'Triceps pushdown', load: '30 kg',           sets: 3, reps: 12, primary: 'triceps',   secondary: null },
]

export const PUSH_DAY_TOTALS = { sets: 19, volumeKg: 9480, duration: '52:00' }

/** Stand vóór de sessie: een rustige week met borst duidelijk achter. */
export function weekBefore(): WeekState {
  return {
    sets:    { shoulders: 2, chest: 2, biceps: 2, triceps: 1, back: 6, core: 2, forearms: 0, glutes: 3, legs: 8, calves: 0 },
    daysAgo: { shoulders: 3, chest: 4, biceps: 5, triceps: 5, back: 2, core: 3, forearms: 99, glutes: 2, legs: 2, calves: 99 },
  }
}

/** Wat de Push Day per spier oplevert: primair vol, secundair half. */
export function pushDayGain(): Partial<Record<MuscleId, number>> {
  const gain: Partial<Record<MuscleId, number>> = {}
  for (const ex of PUSH_DAY) {
    gain[ex.primary] = (gain[ex.primary] ?? 0) + ex.sets
    if (ex.secondary) gain[ex.secondary] = (gain[ex.secondary] ?? 0) + ex.sets * 0.5
  }
  return gain
}

/** Past de winst van één of meer spieren toe en zet ze op "vandaag geraakt". */
export function applyGain(state: WeekState, muscles: MuscleId[]): WeekState {
  const gain = pushDayGain()
  const next: WeekState = { sets: { ...state.sets }, daysAgo: { ...state.daysAgo } }
  for (const id of muscles) {
    next.sets[id] = (next.sets[id] ?? 0) + (gain[id] ?? 0)
    next.daysAgo[id] = 0
  }
  return next
}
