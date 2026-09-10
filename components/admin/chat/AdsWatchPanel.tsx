'use client'

import { useEffect, useState, useTransition } from 'react'
import { fetchWatch, recordWatch, type WatchResult } from '@/app/actions/admin/ads-watch'
import { SourceNote } from '@/components/admin/source-note'

/**
 * Wat de ronde zag: klopt de meting, wat bewoog er, welke test is uit, wat zou je doen.
 *
 * @ai-why: Los van de tabel erboven en niet erin verweven. De tabel beantwoordt "wat
 * kostte het en wat kwam eruit"; dit beantwoordt "en wat moet ik ermee". Die twee door
 * elkaar zetten maakt de tabel onleesbaar precies wanneer er iets aan de hand is.
 *
 * @ai-gotcha: Het openen van dit blok legt niets vast. Vastleggen gebeurt alleen als je op
 * de knop drukt, want een tabel zonder DELETE-policy die volloopt met je paginabezoeken
 * is niet meer op te schonen. Zie app/actions/admin/ads-watch.ts.
 *
 * @ai-sync: app/actions/admin/ads-watch.ts
 * @ai-sync: lib/admin/watch.ts
 */

const ERNST_STIJL = {
  blokkerend: 'border-[#FF3B30]/25 bg-[#FF3B30]/[0.06] text-[#FF3B30]',
  waarschuwing: 'border-[#FF9500]/25 bg-[#FF9500]/[0.06] text-[#FF9500]',
  'ter-info': 'border-white/[0.08] bg-white/[0.02] text-white/55',
} as const

const STATUS_TEKST = {
  goed: 'De meting doet het',
  waarschuwing: 'Er valt iets op aan de meting',
  fout: 'De meting is stuk',
} as const

function Blok({
  ernst,
  children,
}: {
  ernst: keyof typeof ERNST_STIJL
  children: React.ReactNode
}) {
  return <li className={`rounded-lg border p-3 text-[12.5px] ${ERNST_STIJL[ernst]}`}>{children}</li>
}

export function AdsWatchPanel({ days }: { days: number }) {
  const [result, setResult] = useState<WatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [melding, setMelding] = useState<string | null>(null)
  const [bezig, startOverdracht] = useTransition()

  useEffect(() => {
    let afgebroken = false

    // @ai-gotcha: De resets staan in de handlers en niet synchroon in de effect-body. Dat
    // laatste is de vorm die AdminAdsPane hierboven gebruikt, en de lint-regel
    // react-hooks/set-state-in-effect wijst hem terecht af: een setState in de body van
    // een effect zet meteen een tweede render in gang. Hier levert het bovendien niets op,
    // want tot het antwoord binnen is verandert er toch niets zichtbaars.
    fetchWatch(days)
      .then((d) => {
        if (afgebroken) return
        setError(null)
        setMelding(null)
        setResult(d)
      })
      .catch((e: unknown) => !afgebroken && setError(e instanceof Error ? e.message : String(e)))

    // @ai-why: Dezelfde afbreekvlag als de rest van de cockpit: een traag antwoord over
    // zeven dagen mag het verse antwoord over dertig niet overschrijven.
    return () => {
      afgebroken = true
    }
  }, [days])

  if (error) {
    return (
      <div className="rounded-xl border border-[#FF3B30]/30 bg-[#FF3B30]/[0.07] p-5">
        <p className="text-[13px] text-[#FF3B30]">{error}</p>
      </div>
    )
  }

  if (!result?.run) return null

  const { run } = result
  const status = run.check.status

  function leggenVast() {
    startOverdracht(async () => {
      const { vastgelegd, problemen } = await recordWatch(days)
      setMelding(
        problemen.length > 0
          ? `${vastgelegd} vastgelegd, ${problemen.length} niet: ${problemen.join(' · ')}`
          : vastgelegd === 0
            ? 'Er was niets nieuws om vast te leggen.'
            : `${vastgelegd} regel${vastgelegd === 1 ? '' : 's'} in het journaal gezet.`,
      )
      setResult(await fetchWatch(days))
    })
  }

  return (
    <section className="space-y-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-medium text-white">Wat de ronde zag</h2>
          <p
            className={`mt-0.5 text-[12.5px] ${
              status === 'fout'
                ? 'text-[#FF3B30]'
                : status === 'waarschuwing'
                  ? 'text-[#FF9500]'
                  : 'text-[#34C759]'
            }`}
          >
            {STATUS_TEKST[status]}
          </p>
        </div>

        <button
          type="button"
          onClick={leggenVast}
          disabled={bezig || run.events.length === 0 || result.opslagGeblokkeerd !== null}
          className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {bezig ? 'Bezig…' : `Vastleggen (${run.events.length})`}
        </button>
      </div>

      {melding && <p className="text-[12.5px] text-white/50">{melding}</p>}

      {result.opslagGeblokkeerd && (
        <p className="rounded-lg border border-[#FF9500]/25 bg-[#FF9500]/[0.06] p-3 text-[12.5px] text-[#FF9500]">
          {result.opslagGeblokkeerd}
        </p>
      )}

      {run.check.bevindingen.length > 0 && (
        <div>
          <h3 className="mb-2 text-[11px] uppercase tracking-[0.08em] text-white/35">Meting</h3>
          <ul className="space-y-2">
            {run.check.bevindingen.map((b) => (
              <Blok key={b.code} ernst={b.ernst}>
                {b.boodschap}
              </Blok>
            ))}
          </ul>
        </div>
      )}

      {run.signalen.length > 0 && (
        <div>
          <h3 className="mb-2 text-[11px] uppercase tracking-[0.08em] text-white/35">
            Sinds de vorige {days} dagen
          </h3>
          <ul className="space-y-2">
            {run.signalen.map((s) => (
              <Blok key={`${s.code}-${s.campaignId}`} ernst={s.ernst}>
                {s.boodschap}
              </Blok>
            ))}
          </ul>
        </div>
      )}

      {run.conclusies.length > 0 && (
        <div>
          <h3 className="mb-2 text-[11px] uppercase tracking-[0.08em] text-white/35">
            Tests waarvan de looptijd om is
          </h3>
          <ul className="space-y-2">
            {run.conclusies.map((c) => (
              <li
                key={c.testId}
                className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-[12.5px] text-white/60"
              >
                {c.uitkomst}
                {/* @ai-why: De knop om af te sluiten staat hier bewust niet. Een afsluiting
                    vereist een besluit in jouw woorden en het journaal weigert hem leeg;
                    een knop zou dat wegautomatiseren en precies de conclusie overslaan
                    waar de test voor bestond. Zie lib/admin/experiments.ts. */}
                <span className="mt-1 block text-[11.5px] text-white/35">
                  Sluit hem af met een besluit in je eigen woorden; dat kan niet vanaf hier.
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {run.voorstellen.length > 0 && (
        <div>
          <h3 className="mb-2 text-[11px] uppercase tracking-[0.08em] text-white/35">Voorstellen</h3>
          <ul className="space-y-2">
            {run.voorstellen.map((v) => (
              <li
                key={v.campaignId + v.actie}
                className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3"
              >
                <p className="text-[12.5px] text-white">{v.actie}</p>
                <p className="mt-1 text-[12px] text-white/50">{v.motivatie}</p>
                {/* @ai-why: Het risico staat er even prominent bij als de motivatie. Dit
                    systeem voert niets uit, dus de enige bescherming tegen een verkeerd
                    voorstel is dat je leest wat er misgaat als het ernaast zit. */}
                <p className="mt-1.5 text-[12px] text-[#FF9500]/80">Let op: {v.risico}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {run.check.bevindingen.length === 0 &&
        run.signalen.length === 0 &&
        run.conclusies.length === 0 &&
        run.voorstellen.length === 0 && (
          <p className="text-[12.5px] text-white/40">
            Niets bijzonders. Geen kapotte meting, geen beweging die het melden waard is.
          </p>
        )}

      {result.failures.map((f) => (
        <SourceNote key={f.source + f.kind} failure={f} title="Ronde" />
      ))}
    </section>
  )
}
