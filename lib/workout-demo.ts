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
// naar het kader van public/muscle-front.png. Dat is `muscle_front_man_full_hair`
// uit de xcassets: het complete lijf mét haar, en dat leeft in hetzelfde
// overlay-kader als de zonekaart. Daardoor is de omrekening één stap in plaats van
// twee, en staat de gloed exact waar de app hem zet. Glutes staan niet op de
// voorkant en hebben dus geen vlek.
//
// @ai-gotcha: Deze getallen horen bij precies die uitsnede (3072×6144 → 640 breed,
// dan gecentreerd 360×1100). Vervang je het plaatje, dan moeten ze opnieuw uit de
// zonekaart berekend worden; met de hand verschuiven geeft een kaart die er goed
// uitziet en op de verkeerde spier wijst.
export const MUSCLE_BLOBS: Record<MuscleId, Blob[]> = {
  chest:     [{ cx: 0.488, cy: 0.232, rx: 0.285, ry: 0.141 }],
  shoulders: [{ cx: 0.182, cy: 0.220, rx: 0.125, ry: 0.057 }, { cx: 0.789, cy: 0.218, rx: 0.139, ry: 0.059 }],
  back:      [{ cx: 0.271, cy: 0.382, rx: 0.153, ry: 0.123 }, { cx: 0.710, cy: 0.382, rx: 0.153, ry: 0.123 }],
  biceps:    [{ cx: 0.166, cy: 0.314, rx: 0.056, ry: 0.061 }, { cx: 0.818, cy: 0.316, rx: 0.056, ry: 0.061 }],
  triceps:   [{ cx: 0.074, cy: 0.350, rx: 0.049, ry: 0.061 }, { cx: 0.913, cy: 0.351, rx: 0.056, ry: 0.068 }],
  core:      [{ cx: 0.489, cy: 0.420, rx: 0.194, ry: 0.120 }],
  forearms:  [{ cx: 0.087, cy: 0.469, rx: 0.083, ry: 0.114 }, { cx: 0.901, cy: 0.470, rx: 0.083, ry: 0.111 }],
  legs:      [{ cx: 0.302, cy: 0.600, rx: 0.194, ry: 0.114 }, { cx: 0.685, cy: 0.601, rx: 0.194, ry: 0.114 }],
  calves:    [{ cx: 0.242, cy: 0.840, rx: 0.146, ry: 0.136 }, { cx: 0.751, cy: 0.841, rx: 0.146, ry: 0.136 }],
  glutes:    [],
}

// @ai-why: De achterkant is een eigen kaart met eigen zwaartepunten, uit
// `back_male` in dezelfde zonekaart. Borst, biceps en core staan er niet op; die
// spieren kleuren dus alleen aan de voorkant. Dat is geen omissie maar wat je van
// achteren ziet.
//
// @ai-gotcha: Het achterkant-kader is 400×1100 en het voorkant-kader 360×1100.
// De achterkant is breder (latspreiding), dus één gedeelde verhouding zou de
// gloed schuintrekken. Beide kaders staan als `aspect` in SIDES hieronder.
export const MUSCLE_BLOBS_BACK: Record<MuscleId, Blob[]> = {
  shoulders: [{ cx: 0.212, cy: 0.225, rx: 0.106, ry: 0.048 }, { cx: 0.798, cy: 0.226, rx: 0.100, ry: 0.048 }],
  back:      [{ cx: 0.504, cy: 0.296, rx: 0.281, ry: 0.211 }],
  triceps:   [{ cx: 0.166, cy: 0.323, rx: 0.081, ry: 0.066 }, { cx: 0.843, cy: 0.324, rx: 0.069, ry: 0.066 }],
  forearms:  [{ cx: 0.106, cy: 0.426, rx: 0.075, ry: 0.068 }, { cx: 0.900, cy: 0.428, rx: 0.075, ry: 0.068 }],
  glutes:    [{ cx: 0.314, cy: 0.516, rx: 0.231, ry: 0.086 }, { cx: 0.697, cy: 0.517, rx: 0.231, ry: 0.084 }],
  legs:      [{ cx: 0.322, cy: 0.640, rx: 0.162, ry: 0.082 }, { cx: 0.682, cy: 0.640, rx: 0.163, ry: 0.080 }],
  calves:    [{ cx: 0.279, cy: 0.837, rx: 0.119, ry: 0.139 }, { cx: 0.729, cy: 0.838, rx: 0.119, ry: 0.139 }],
  chest:     [],
  biceps:    [],
  core:      [],
}

export type BodySide = 'front' | 'back'

export const SIDES: Record<BodySide, { src: string; blobs: Record<MuscleId, Blob[]>; aspect: string; label: string }> = {
  front: { src: '/muscle-front.png', blobs: MUSCLE_BLOBS,      aspect: '305.56%', label: 'Front' },
  back:  { src: '/muscle-back.png',  blobs: MUSCLE_BLOBS_BACK, aspect: '275%',    label: 'Back' },
}

/**
 * Eén logregel: zoveel sets op deze spier, op deze dag.
 *
 * @ai-why: Een log van losse regels en niet een teller per spier. De score van een
 * spier hangt af van hoe oud élke set is (vol gewicht t/m dag 7, daarna uitdovend),
 * dus je kunt het niet samenvatten in één getal zonder de leeftijd te verliezen.
 * Dat is precies de fout die ADR-014 in de app rechtzette.
 */
export interface LogEntry {
  muscle: MuscleId
  sets: number
  /** Dagnummer binnen de demo. Maandag van deze week is 0, vorige week negatief. */
  day: number
}

export interface WeekState {
  today: number
  log: readonly LogEntry[]
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
  let sets = 0
  for (const e of state.log) {
    if (e.muscle !== muscle.id) continue
    const daysAgo = state.today - e.day
    if (daysAgo < 0) continue
    sets += e.sets * volumeDecay(daysAgo)
  }
  return Math.min(1, sets / muscle.weeklyTarget)
}

function daysSince(muscle: MuscleId, state: WeekState): number {
  let best = Infinity
  for (const e of state.log) {
    if (e.muscle !== muscle) continue
    const d = state.today - e.day
    if (d >= 0 && d < best) best = d
  }
  return best
}

// @ai-why: Warmte is niet hetzelfde als score. De balk gaat over volume in een
// week, de kleur over "hoe recent belast". Daarom een eigen venster per spier,
// met een staart zodat de tint niet op de dag van herstel abrupt uitgaat.
export function heatOf(muscle: MuscleDef, state: WeekState): number {
  const d = daysSince(muscle.id, state)
  const window = muscle.recoveryDays + 1.5
  if (!Number.isFinite(d) || d >= window) return 0
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
// De week in de demo
// ---------------------------------------------------------------------------

export interface DemoExercise {
  name: string
  load: string
  sets: number
  reps: number
  primary: MuscleId
  /** Telt voor de helft mee, zoals WorkoutMuscleResolver het doet. */
  secondary: MuscleId | null
}

export interface DemoSession {
  /** 0 = maandag. */
  day: number
  dayLabel: string
  name: string
  duration: string
  exercises: readonly DemoExercise[]
  /** Wat de coach erover zegt. Kort houden: één regel per sessie. */
  note: string
}

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

// @ai-why: Drie sessies en geen vijf. Vier of meer laat elke balk vollopen en dan
// zegt de week niets meer; met drie blijft zichtbaar wát er overblijft (kuiten,
// core), en dat is precies waar de coach op stuurt.
export const WEEK: readonly DemoSession[] = [
  {
    day: 0, dayLabel: 'Mon', name: 'Push Day', duration: '52:00',
    note: 'Chest full. Triceps came along for free.',
    exercises: [
      { name: 'Bench press',      load: '80 kg',     sets: 4, reps: 8,  primary: 'chest',     secondary: 'triceps' },
      { name: 'Incline dumbbell', load: '28 kg',     sets: 4, reps: 10, primary: 'chest',     secondary: 'shoulders' },
      { name: 'Overhead press',   load: '45 kg',     sets: 4, reps: 8,  primary: 'shoulders', secondary: 'triceps' },
      { name: 'Dips',             load: 'bodyweight',sets: 4, reps: 10, primary: 'chest',     secondary: 'triceps' },
    ],
  },
  {
    day: 1, dayLabel: 'Tue', name: 'Pull Day', duration: '48:00',
    note: 'Back and biceps in. Chest still warm from yesterday.',
    exercises: [
      { name: 'Pull-up',       load: 'bodyweight', sets: 4, reps: 8,  primary: 'back',   secondary: 'biceps' },
      { name: 'Barbell row',   load: '70 kg',      sets: 4, reps: 10, primary: 'back',   secondary: 'biceps' },
      { name: 'Lat pulldown',  load: '60 kg',      sets: 3, reps: 12, primary: 'back',   secondary: 'biceps' },
      { name: 'Hammer curl',   load: '16 kg',      sets: 3, reps: 12, primary: 'biceps', secondary: 'forearms' },
    ],
  },
  {
    day: 3, dayLabel: 'Thu', name: 'Leg Day', duration: '61:00',
    note: 'Legs done. Calves still light.',
    exercises: [
      { name: 'Back squat',      load: '100 kg', sets: 5, reps: 5,  primary: 'legs',   secondary: 'glutes' },
      { name: 'Romanian deadlift', load: '80 kg', sets: 4, reps: 8, primary: 'legs',   secondary: 'glutes' },
      { name: 'Leg press',       load: '160 kg', sets: 3, reps: 12, primary: 'legs',   secondary: 'glutes' },
      { name: 'Calf raise',      load: '60 kg',  sets: 4, reps: 15, primary: 'calves', secondary: null },
    ],
  },
]

/** Wat de sessie per spier oplevert: primair vol, secundair half. */
export function sessionEntries(session: DemoSession): LogEntry[] {
  const perMuscle = new Map<MuscleId, number>()
  for (const ex of session.exercises) {
    perMuscle.set(ex.primary, (perMuscle.get(ex.primary) ?? 0) + ex.sets)
    if (ex.secondary) perMuscle.set(ex.secondary, (perMuscle.get(ex.secondary) ?? 0) + ex.sets * 0.5)
  }
  return [...perMuscle].map(([muscle, sets]) => ({ muscle, sets, day: session.day }))
}

export function sessionTotals(session: DemoSession) {
  return { sets: session.exercises.reduce((n, e) => n + e.sets, 0) }
}

// @ai-why: Vorige week staat in het log met negatieve dagnummers en niet als
// beginstand. Daardoor dooft hij in de demo zichtbaar uit: op zondag telt werk van
// negen dagen terug nog voor 71% mee, en dat is precies wat het uitfaden doet.
const LAST_WEEK: readonly LogEntry[] = [
  { muscle: 'chest', sets: 8, day: -9 },
  { muscle: 'back', sets: 10, day: -8 },
  { muscle: 'shoulders', sets: 5, day: -9 },
  { muscle: 'triceps', sets: 4, day: -9 },
  { muscle: 'biceps', sets: 4, day: -8 },
  { muscle: 'legs', sets: 10, day: -6 },
  { muscle: 'glutes', sets: 5, day: -6 },
  { muscle: 'core', sets: 3, day: -6 },
]

/** Maandagochtend: alleen vorige week, aan het uitdoven. */
export function weekStart(): WeekState {
  return { today: 0, log: [...LAST_WEEK] }
}

export function withSession(state: WeekState, session: DemoSession): WeekState {
  return { today: session.day, log: [...state.log, ...sessionEntries(session)] }
}

export function atDay(state: WeekState, day: number): WeekState {
  return { ...state, today: day }
}
