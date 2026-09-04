'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  WEEK, DAY_LABELS, weekStart, withSession, atDay, weekScore, sessionTotals,
  type DemoSession, type MuscleId, type WeekState,
} from '@/lib/workout-demo'
import { MuscleMap } from './MuscleMap'
import { HypertrophyBars } from './HypertrophyBars'
import { InlineAuth, type AuthMode } from './InlineAuth'

// @ai-why: Engelse labels. De site is Engelstalig; de iOS-app levert en + nl, maar
// hier praat de coach in de taal van de pagina.
const SHORT: Partial<Record<MuscleId, string>> = {
  chest: 'chest', shoulders: 'shoulders', triceps: 'triceps',
  back: 'back', biceps: 'biceps', forearms: 'forearms',
  legs: 'legs', glutes: 'glutes', calves: 'calves', core: 'core',
}

type Bubble =
  | { key: string; kind: 'ask'; text: string }
  | { key: string; kind: 'session'; session: DemoSession }
  | { key: string; kind: 'note'; text: string }
  | { key: string; kind: 'rest'; label: string }
  | { key: string; kind: 'close'; text: string }

// @ai-why: De coach zegt één regel per sessie en één aan het eind, en verder niets.
// De vorige versie schreef vier alinea's onder één workout; dat las als een essay
// naast een grafiek. Wat er te zien valt staat in het paneel, niet in de tekst.
// @ai-gotcha: Deze regel noemt letters, dus hij liegt zodra iemand aan LAST_WEEK of
// aan een sessie zit. Nagerekend op het model: maandagochtend C (28%), na de push B
// (46%), vanaf dinsdag A. Verander je de week, reken hem dan opnieuw na.
const CLOSING = 'Week done. <b>C to A</b>, and core is the only thing you skipped.'

export function WorkoutsDemo() {
  const [state, setState] = useState<WeekState>(weekStart)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  // @ai-why: null = de demo draait. 'signup' klapt de linkerkolom om en laat het
  // paneel staan; 'login' verbergt het paneel ook, want daar is geen belofte meer
  // te tonen — je hebt je scherm al.
  const [auth, setAuth] = useState<AuthMode | null>(null)
  const timeouts = useRef<NodeJS.Timeout[]>([])
  const streamRef = useRef<HTMLDivElement>(null)

  const run = useCallback(() => {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
    let live = weekStart()

    let t = 0
    const at = (ms: number, fn: () => void) => {
      t += ms
      timeouts.current.push(setTimeout(fn, t))
    }

    // @ai-why: De reset loopt door dezelfde timeout-keten en niet synchroon. Wordt
    // `run` uit een effect aangeroepen, dan is een synchrone setState daar een
    // cascading render (react-hooks/set-state-in-effect); via de keten gebeurt het
    // in dezelfde tick als de rest van de demo en is het gedrag identiek.
    at(0, () => {
      setState(weekStart())
      setBubbles([])
    })

    // @ai-why: De bezoeker opent, niet de coach. Zonder die vraag rollen er kaarten
    // een leeg scherm in en is niet te zien dat je Carve iets vráágt; met de vraag
    // erboven is alles eronder het antwoord.
    at(400, () => setBubbles([{ key: 'ask', kind: 'ask', text: 'Give me a week review' }]))

    WEEK.forEach((session, i) => {
      // @ai-why: De rustdag krijgt een eigen regel in de stroom. Zonder dat springt
      // de week van dinsdag naar donderdag en lijkt het silhouet zomaar af te koelen.
      const prev = i === 0 ? -1 : WEEK[i - 1].day
      for (let d = prev + 1; d < session.day; d++) {
        const label = DAY_LABELS[d]
        at(700, () => {
          setState((s) => atDay(s, d))
          setBubbles((b) => [...b, { key: `rest-${d}`, kind: 'rest', label }])
        })
      }
      at(i === 0 ? 900 : 900, () => {
        live = withSession(live, session)
        setState(live)
        setBubbles((b) => [...b, { key: `s-${session.day}`, kind: 'session', session }])
      })
      at(900, () => setBubbles((b) => [...b, { key: `n-${session.day}`, kind: 'note', text: session.note }]))
    })

    const last = WEEK[WEEK.length - 1].day
    for (let d = last + 1; d <= 6; d++) {
      at(650, () => {
        setState((s) => atDay(s, d))
        setBubbles((b) => [...b, { key: `rest-${d}`, kind: 'rest', label: DAY_LABELS[d] }])
      })
    }
    at(800, () => setBubbles((b) => [...b, { key: 'close', kind: 'close', text: CLOSING }]))
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
  const sessionDays = new Set(WEEK.map((s) => s.day))

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-6">
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111112] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        {/* @ai-why: Zonder paneel is er geen tweede kolom, dus het raster moet mee.
            Bleef het op twee kolommen staan, dan stond het formulier in de linkerhelft
            met een lege kolom ernaast. */}
        <div className={auth === 'login' ? 'grid grid-cols-1' : 'grid grid-cols-1 lg:grid-cols-[1fr_340px]'}>
          {/* @ai-why: De aanmelding klapt de linkerkolom om en laat het paneel staan.
              De demo eindigt met een lijf vol data die niet van jou is; navigeer je
              daarvoor weg naar /signup, dan is dat verband weg. Zo staat je toekomstige
              scherm er nog terwijl je je aanmeldt. */}
          {auth ? (
            <InlineAuth
              mode={auth}
              onModeChange={setAuth}
              domain="workouts"
              accent="#E4783E"
              promise="Log your first session and this silhouette is yours: warm where you trained, and ten bars that move with your week."
              onCancel={() => setAuth(null)}
            />
          ) : (
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2.5 border-b border-white/[0.05] px-[18px] py-3.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E4783E]" />
              <span className="text-[12.5px] font-semibold text-white/55">Carve</span>
              <span className="ml-auto font-mono text-[10.5px] text-white/20">one week</span>
            </div>

            {/* @ai-gotcha: Elk kind hieronder draagt `shrink-0`. De stroom heeft een
                vaste hoogte, dus zonder dat krimpen de flex-items zodra de inhoud
                niet meer past — en met `overflow-hidden` op de sessiekaart betekent
                krimpen dat je van een workout van vier oefeningen alleen de eerste
                regel ziet. Er kwam geen fout, de kaart was gewoon te kort. */}
            <div ref={streamRef} className="flex h-[460px] flex-col gap-3 overflow-y-auto px-[18px] py-5 lg:h-[560px]">
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
                if (b.kind === 'rest') {
                  return (
                    <div key={b.key} className="carve-msg-in flex shrink-0 items-center gap-3 py-0.5">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/20">{b.label}</span>
                      <span className="h-px flex-1 bg-white/[0.05]" />
                      <span className="font-mono text-[10px] text-white/[0.14]">rest</span>
                    </div>
                  )
                }
                if (b.kind === 'session') return <SessionCard key={b.key} session={b.session} />
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
                    className="carve-msg-in demo-coach max-w-[54ch] shrink-0 border-l-2 border-[#E4783E]/50 pl-3 text-[13.5px] leading-[1.6] text-white/55"
                    dangerouslySetInnerHTML={{ __html: b.text }}
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
          )}

          {/* @ai-why: Bij inloggen valt het paneel weg. Aanmelden gaat over wat je
              krijgt, dus daar hoort je toekomstige scherm naast te staan; inloggen
              gaat over binnenkomen, en dan is datzelfde paneel met andermans data
              alleen nog ruis. */}
          {auth !== 'login' && (
          <div className="flex min-w-0 flex-col border-t border-white/[0.06] bg-[#0c0c0d] lg:border-l lg:border-t-0">
            <div className="flex items-center gap-2.5 border-b border-white/[0.05] px-[18px] py-3.5">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/20">This week</span>
              <span className="ml-auto flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] py-1 pl-3 pr-2.5">
                <em className="font-mono text-[9.5px] not-italic uppercase tracking-[0.14em] text-white/20">Week</em>
                <b className="min-w-[15px] text-center text-[16px] font-extrabold text-white">{tier ?? '–'}</b>
              </span>
            </div>

            {/* @ai-why: De weekstrip is er zodat je kunt volgen waar in de week je
                bent zonder de stroom te lezen. Zonder hem koelt het silhouet af en
                weet je niet of dat komt door een rustdag of door een fout. */}
            <div className="flex gap-1 border-b border-white/[0.05] px-4 py-2.5">
              {DAY_LABELS.map((label, d) => {
                const trained = sessionDays.has(d)
                const now = state.today === d
                return (
                  <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className={`font-mono text-[9px] uppercase tracking-[0.1em] ${now ? 'text-white/70' : 'text-white/20'}`}>
                      {label}
                    </span>
                    <span
                      className={`h-1 w-full rounded-full transition-colors duration-500 ${
                        d > state.today
                          ? 'bg-white/[0.05]'
                          : trained
                            ? 'bg-[#E4783E]'
                            : 'bg-white/20'
                      }`}
                    />
                  </div>
                )
              })}
            </div>

            {/* @ai-why: Voor en achter naast elkaar. Met alleen de voorkant blijven
                rug, billen en kuiten kleurloos terwijl de balken ernaast wél bewegen,
                en dan lijkt de kaart kapot op precies de dag dat je benen of rug deed.
                De balken staan eronder in plaats van ernaast, want naast twee figuren
                is er geen kolom meer over die breed genoeg is om te lezen. */}
            <div className="flex flex-1 flex-col gap-3 px-4 pb-[18px] pt-3.5">
              <div className="flex items-start justify-center gap-3">
                {(['front', 'back'] as const).map((side) => (
                  <div key={side} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                    <MuscleMap state={state} side={side} className="max-w-[148px]" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/20">
                      {side === 'front' ? 'Front' : 'Back'}
                    </span>
                  </div>
                ))}
              </div>
              <HypertrophyBars state={state} />
            </div>
          </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.05] bg-[#0e0e0f] px-[18px] py-3.5">
          {!auth && (
            <button
              onClick={() => setAuth('signup')}
              className="rounded-full bg-[#E4783E] px-5 py-2 text-[12.5px] font-semibold text-[#0A0A0B] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Make it yours
            </button>
          )}
          <button
            onClick={() => { setAuth(null); run() }}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[12px] font-semibold text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            ↻ Replay the week
          </button>
          {/* @ai-why: Alleen zichtbaar zolang de demo draait. Onder een inlogformulier
              is "demo data" een bijschrift bij iets dat er niet meer staat. */}
          {!auth && (
            <span className="ml-auto font-mono text-[10.5px] text-white/20">demo data · none of this is yours</span>
          )}
        </div>
      </div>
    </div>
  )
}

function SessionCard({ session }: { session: DemoSession }) {
  const { sets } = sessionTotals(session)
  return (
    <div className="carve-msg-in shrink-0 overflow-hidden rounded-[13px] border border-white/[0.08] bg-[#161617]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.05] px-3.5 py-3 text-[13.5px] font-semibold">
        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#E4783E] text-[10.5px] font-extrabold text-[#0A0A0B]">
          ✓
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">{session.dayLabel}</span>
        {session.name}
        <span className="ml-auto font-mono text-[11px] font-normal text-white/20">
          {sets} sets · {session.duration}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 px-3.5 py-3">
        {session.exercises.map((ex) => (
          <div key={ex.name} className="flex items-baseline gap-2.5 text-[12.5px] text-white/55">
            <b className="font-semibold text-white">{ex.name}</b>
            {ex.sets} × {ex.reps}
            {/* @ai-why: De spieren staan hier en niet in de coachtekst. "½ triceps" is
                de secundaire regel uit WorkoutMuscleResolver, en het is de uitleg
                waarom triceps volloopt zonder eigen oefening. */}
            <span className="ml-auto shrink-0 font-mono text-[10.5px] text-white/20">
              {ex.secondary ? `${SHORT[ex.primary]} · ½ ${SHORT[ex.secondary]}` : SHORT[ex.primary]}
            </span>
            <span className="w-[80px] shrink-0 text-right font-mono text-[11px] text-white/25">{ex.load}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
