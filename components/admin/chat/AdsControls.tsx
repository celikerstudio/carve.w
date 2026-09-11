'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  knoppenBeschikbaar,
  legWijzigingVast,
  pauzeerOfHervat,
  zetDagbudget,
  type ControlResult,
  type WijzigingInvoer,
} from '@/app/actions/admin/ads-control'
import type { AdCampaignRow } from '@/lib/admin/ads'
import { uitMinorUnit, zetLeerfaseTerug } from '@/lib/admin/budget'

/**
 * De knoppen uit TDR-0011, plus het losse formulier uit beslissing 11.
 *
 * @ai-why: Een eigen blok onder de tabel en geen extra kolom erin. De tabel is al
 * `min-w-[720px]` met acht kolommen; er nog een actiekolom bij zou hem op een telefoon
 * onleesbaar maken, en dit is precies het scherm waarop je zit als er iets mis is.
 *
 * @ai-why: Het formulier eist drie velden omdat lib/admin/journal.ts die eist. Dat voelt
 * als veel voor een knopdruk, en dat is de bedoeling: een wijziging die je niet kunt
 * onderbouwen hoor je niet te maken, en de verwachting vooraf is het enige dat je achteraf
 * laat zien of je gelijk had.
 *
 * @ai-gotcha: Alle bewaking zit óók op de server (lib/admin/meta-write.ts en
 * app/actions/admin/ads-control.ts). Wat hier staat is er voor de leesbaarheid; een server
 * action is een publiek endpoint en deze component is niet de enige ingang.
 *
 * @ai-sync: app/actions/admin/ads-control.ts
 * @ai-sync: docs/tdr/0011-de-cockpit-bedient-de-campagnes.md
 */

type Soort = 'status' | 'budget' | 'los'

interface Bezig {
  soort: Soort
  campagne: AdCampaignRow | null
  /** Bij 'budget': het nieuwe bedrag zoals je het typt, dus 20 voor twintig euro. */
  bedrag: string
}

const LEEG: WijzigingInvoer = { wat: '', waarom: '', verwacht: '' }

/**
 * @ai-gotcha: EUR staat hier hard, terwijl de server de echte accountvaluta bij Meta
 * ophaalt. Dat mag omdat lib/admin/budget.ts vandaag alleen EUR kent en luid faalt op de
 * rest; komt er een valuta bij, dan moet die factor hier mee en niet alleen daar.
 */
function euro(minor: number | null): string {
  if (minor === null) return '—'
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
    uitMinorUnit(minor, 'EUR'),
  )
}

function draait(rij: AdCampaignRow): boolean {
  return rij.effectiveStatus === 'ACTIVE'
}

function Veld({
  label,
  waarde,
  hint,
  onChange,
}: {
  label: string
  waarde: string
  hint: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.08em] text-white/35">{label}</span>
      <input
        value={waarde}
        onChange={(e) => onChange(e.target.value)}
        placeholder={hint}
        className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12.5px] text-white placeholder:text-white/25 focus:border-white/20 focus:outline-none"
      />
    </label>
  )
}

export function AdsControls({ rows, onDone }: { rows: AdCampaignRow[]; onDone: () => void }) {
  const [mag, setMag] = useState<boolean | null>(null)
  const [bezig, setBezig] = useState<Bezig | null>(null)
  const [invoer, setInvoer] = useState<WijzigingInvoer>(LEEG)
  const [uitkomst, setUitkomst] = useState<ControlResult | null>(null)
  const [verstuurt, startOverdracht] = useTransition()

  useEffect(() => {
    let afgebroken = false
    knoppenBeschikbaar()
      .then((b) => !afgebroken && setMag(b))
      .catch(() => !afgebroken && setMag(false))
    return () => {
      afgebroken = true
    }
  }, [])

  function open(soort: Soort, campagne: AdCampaignRow | null) {
    setBezig({ soort, campagne, bedrag: '' })
    setInvoer(LEEG)
    setUitkomst(null)
  }

  function sluit() {
    setBezig(null)
    setInvoer(LEEG)
  }

  function verstuur() {
    if (!bezig) return

    startOverdracht(async () => {
      const { soort, campagne, bedrag } = bezig
      let resultaat: ControlResult

      if (soort === 'los') {
        resultaat = await legWijzigingVast(campagne?.id ?? null, invoer)
      } else if (soort === 'status' && campagne) {
        resultaat = await pauzeerOfHervat(
          campagne.id,
          draait(campagne) ? 'PAUSED' : 'ACTIVE',
          draait(campagne) ? 'ACTIVE' : 'PAUSED',
          invoer,
        )
      } else if (soort === 'budget' && campagne) {
        resultaat = await zetDagbudget(
          campagne.id,
          Number(bedrag),
          campagne.dailyBudgetMinor,
          invoer,
        )
      } else {
        return
      }

      setUitkomst(resultaat)
      if (resultaat.ok) {
        sluit()
        onDone()
      }
    })
  }

  const nieuwMinor = bezig?.bedrag ? Math.round(Number(bezig.bedrag) * 100) : null
  const leerfase =
    bezig?.soort === 'budget' &&
    nieuwMinor !== null &&
    bezig.campagne?.dailyBudgetMinor != null &&
    zetLeerfaseTerug(bezig.campagne.dailyBudgetMinor, nieuwMinor)

  return (
    <section className="space-y-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div>
        <h2 className="text-[15px] font-medium text-white">Bedienen</h2>
        <p className="mt-0.5 text-[12.5px] text-white/45">
          Wat je hier doet komt meteen in het journaal, met je verwachting erbij. Wat je in Ads
          Manager doet niet; leg dat vast met de knop onderaan.
        </p>
      </div>

      {mag === false && (
        <p className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-[12.5px] text-white/50">
          Deze omgeving mag niet schrijven, want <code className="font-mono">META_WRITE_TOKEN</code>{' '}
          staat niet gezet. Vastleggen kan wel.
        </p>
      )}

      {mag && rows.length > 0 && (
        <ul className="space-y-2">
          {rows.map((rij) => (
            <li
              key={rij.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-[12.5px] text-white">{rij.name}</p>
                {/* @ai-why: effective_status en niet status. Een campagne op ACTIVE waarvan
                    alle ad sets gepauzeerd staan draait niet, en "actief" zien staan terwijl
                    er niets gebeurt kost je een week. Zie TDR-0011 beslissing 10. */}
                <p className="text-[11.5px] text-white/35">
                  {rij.effectiveStatus ?? 'status onbekend'} · dagbudget {euro(rij.dailyBudgetMinor)}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => open('status', rij)}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/[0.06] hover:text-white"
                >
                  {draait(rij) ? 'Pauzeren' : 'Hervatten'}
                </button>

                {rij.dailyBudgetMinor === null ? (
                  <span
                    title="Zonder Advantage Campaign Budget staat het dagbudget bij Meta op de ad set, niet op de campagne. Een looptijdbudget accepteert al helemaal geen dagbudget."
                    className="self-center text-[11.5px] text-white/25"
                  >
                    geen campagnebudget
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => open('budget', rij)}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/[0.06] hover:text-white"
                  >
                    Budget
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => open('los', null)}
        className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-white/70 hover:bg-white/[0.06] hover:text-white"
      >
        Ik heb iets veranderd in Ads Manager
      </button>

      {bezig && (
        <div className="space-y-3 rounded-lg border border-white/[0.1] bg-white/[0.03] p-4">
          {bezig.soort === 'status' && bezig.campagne && (
            <p className="text-[12.5px] text-white">
              {bezig.campagne.name}: van {bezig.campagne.effectiveStatus} naar{' '}
              {draait(bezig.campagne) ? 'PAUSED' : 'ACTIVE'}.{' '}
              {draait(bezig.campagne) && (
                <span className="text-[#FF9500]">
                  Pauzeren gooit de leerfase weg die het platform heeft opgebouwd; weer aanzetten
                  brengt die niet terug.
                </span>
              )}
            </p>
          )}

          {bezig.soort === 'budget' && bezig.campagne && (
            <div className="space-y-2">
              <p className="text-[12.5px] text-white">
                {bezig.campagne.name}: dagbudget van {euro(bezig.campagne.dailyBudgetMinor)} naar
              </p>
              <input
                value={bezig.bedrag}
                onChange={(e) => setBezig({ ...bezig, bedrag: e.target.value })}
                inputMode="decimal"
                placeholder="20"
                className="w-32 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12.5px] text-white placeholder:text-white/25 focus:border-white/20 focus:outline-none"
              />
              {leerfase && (
                <p className="text-[12px] text-[#FF9500]">
                  Dit is een wijziging van meer dan twintig procent, dus de ad set gaat terug de
                  leerfase in. Reken op een paar dagen onrustige cijfers.
                </p>
              )}
            </div>
          )}

          <Veld
            label="Wat verandert er"
            waarde={invoer.wat}
            hint="dagbudget van 10 naar 20 euro"
            onChange={(v) => setInvoer({ ...invoer, wat: v })}
          />
          <Veld
            label="Waarom"
            waarde={invoer.waarom}
            hint="te weinig vertoningen om iets van te zeggen"
            onChange={(v) => setInvoer({ ...invoer, waarom: v })}
          />
          <Veld
            label="Wat verwacht je"
            waarde={invoer.verwacht}
            hint="ruwweg tweemaal zoveel klikken, kosten per klik gelijk"
            onChange={(v) => setInvoer({ ...invoer, verwacht: v })}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={verstuur}
              disabled={verstuurt || !invoer.wat || !invoer.waarom || !invoer.verwacht}
              className="rounded-lg border border-white/[0.12] bg-white/[0.06] px-3 py-1.5 text-[12.5px] text-white hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {verstuurt ? 'Bezig…' : 'Doorvoeren en vastleggen'}
            </button>
            <button
              type="button"
              onClick={sluit}
              disabled={verstuurt}
              className="rounded-lg px-3 py-1.5 text-[12.5px] text-white/45 hover:text-white/70"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {uitkomst && !uitkomst.ok && (
        <div className="rounded-lg border border-[#FF3B30]/30 bg-[#FF3B30]/[0.07] p-3">
          <p className="text-[12.5px] text-[#FF3B30]">{uitkomst.probleem}</p>
          {/* @ai-why: Het onderscheid tussen "mislukt" en "we weten het niet" staat er
              letterlijk. Bij `onbekend` kan Meta de wijziging wél hebben toegepast, en dan is
              zelf gaan kijken de enige manier om dat vast te stellen. */}
          {uitkomst.onbekend && (
            <p className="mt-1 text-[12px] text-[#FF9500]">
              De uitkomst is onbekend: Meta kan dit wél hebben doorgevoerd. Kijk in Ads Manager
              wat er staat.{' '}
              {uitkomst.vastgelegd
                ? 'Er staat een journaalregel met "uitkomst onbekend".'
                : 'Er is niets vastgelegd.'}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
