import { describe, expect, it } from 'vitest'
import {
  openTests,
  parseJournalBody,
  validateEvent,
  type JournalEvent,
} from './journal'

function gebeurtenis(over: Partial<JournalEvent> = {}): JournalEvent {
  return {
    id: 'a1',
    at: '2026-09-10T09:00:00.000Z',
    kind: 'test',
    campaignId: '120210000000001',
    body: {},
    ref: null,
    ...over,
  }
}

describe('parseJournalBody', () => {
  it('weigert een wijziging zonder verwachting', () => {
    const uitkomst = parseJournalBody('wijziging', {
      wat: 'dagbudget van 10 naar 20 euro',
      waarom: 'te weinig vertoningen',
    })

    expect(uitkomst.ok).toBe(false)
  })

  it('accepteert een volledige wijziging', () => {
    const uitkomst = parseJournalBody('wijziging', {
      wat: 'dagbudget van 10 naar 20 euro',
      waarom: 'te weinig vertoningen om iets van te zeggen',
      verwacht: 'ruwweg tweemaal zoveel klikken, kosten per klik gelijk',
    })

    expect(uitkomst.ok).toBe(true)
  })

  it('weigert een test zonder besliscriterium', () => {
    const uitkomst = parseJournalBody('test', {
      hypothese: 'een screenshot met tekst erop klikt beter',
      variabele: 'creatief',
      verwacht: 'hogere doorklikratio',
      loopttot: '2026-09-24',
    })

    expect(uitkomst.ok).toBe(false)
  })

  it('weigert een test die korter loopt dan de minimale looptijd', () => {
    const uitkomst = parseJournalBody('test', {
      hypothese: 'een screenshot met tekst erop klikt beter',
      variabele: 'creatief',
      verwacht: 'hogere doorklikratio',
      criterium: 'doorklikratio minstens een kwart hoger',
      startte: '2026-09-10',
      loopttot: '2026-09-12',
    })

    expect(uitkomst.ok).toBe(false)
  })

  it('accepteert een test die lang genoeg loopt', () => {
    const uitkomst = parseJournalBody('test', {
      hypothese: 'een screenshot met tekst erop klikt beter',
      variabele: 'creatief',
      verwacht: 'hogere doorklikratio',
      criterium: 'doorklikratio minstens een kwart hoger',
      startte: '2026-09-10',
      loopttot: '2026-09-24',
    })

    expect(uitkomst.ok).toBe(true)
  })

  it('vat een controle samen als fout zodra er een blokkerende bevinding is', () => {
    const uitkomst = parseJournalBody('controle', {
      status: 'fout',
      bevindingen: [
        { code: 'utm_id_ontbreekt', ernst: 'blokkerend', boodschap: 'campagne zomer_2026 mist utm_id' },
      ],
    })

    expect(uitkomst.ok).toBe(true)
  })

  it('weigert een controle zonder bevindingen bij status fout', () => {
    const uitkomst = parseJournalBody('controle', { status: 'fout', bevindingen: [] })

    expect(uitkomst.ok).toBe(false)
  })

  it('weigert een voorstel zonder onderbouwing', () => {
    const uitkomst = parseJournalBody('voorstel', {
      actie: 'campagne zomer_2026 pauzeren',
      motivatie: 'kosten per app-store-klik viermaal het gemiddelde',
    })

    expect(uitkomst.ok).toBe(false)
  })
})

describe('validateEvent', () => {
  it('weigert een afsluiting zonder verwijzing naar wat er wordt afgesloten', () => {
    const uitkomst = validateEvent(
      gebeurtenis({
        kind: 'afsluiting',
        ref: null,
        body: { uitkomst: 'hypothese hield geen stand', besluit: 'terug naar het oude creatief' },
      }),
    )

    expect(uitkomst.ok).toBe(false)
  })

  it('accepteert een afsluiting met verwijzing', () => {
    const uitkomst = validateEvent(
      gebeurtenis({
        kind: 'afsluiting',
        ref: 'a1',
        body: { uitkomst: 'hypothese hield geen stand', besluit: 'terug naar het oude creatief' },
      }),
    )

    expect(uitkomst.ok).toBe(true)
  })
})

describe('openTests', () => {
  const lopend = gebeurtenis({ id: 'test-1', kind: 'test' })
  const afgerond = gebeurtenis({ id: 'test-2', kind: 'test' })
  const afsluiting = gebeurtenis({ id: 'slot-1', kind: 'afsluiting', ref: 'test-2' })

  it('geeft alleen tests terug die nog geen afsluiting hebben', () => {
    const open = openTests([lopend, afgerond, afsluiting])

    expect(open.map((e) => e.id)).toEqual(['test-1'])
  })

  it('telt een wijziging niet mee als open test', () => {
    const open = openTests([gebeurtenis({ id: 'w-1', kind: 'wijziging' })])

    expect(open).toEqual([])
  })
})

describe('parseJournalBody, gaten die de review vond', () => {
  it('weigert een datum die niet bestaat', () => {
    const uitkomst = parseJournalBody('test', {
      hypothese: 'h',
      variabele: 'creatief',
      verwacht: 'meer',
      criterium: 'een kwart hoger',
      startte: '2026-09-01',
      loopttot: '2026-13-45',
    })

    expect(uitkomst.ok).toBe(false)
    expect(uitkomst.ok === false && uitkomst.problemen.join(' ')).toContain('bestaat niet')
  })

  it('weigert een einddatum die vóór de startdatum ligt', () => {
    const uitkomst = parseJournalBody('test', {
      hypothese: 'h',
      variabele: 'creatief',
      verwacht: 'meer',
      criterium: 'een kwart hoger',
      startte: '2026-09-20',
      loopttot: '2026-09-01',
    })

    expect(uitkomst.ok).toBe(false)
  })
})

describe('wijziging draagt de waargenomen uitkomst', () => {
  const basis = {
    wat: 'dagbudget van 10 naar 20 euro',
    waarom: 'te weinig bereik',
    verwacht: 'ruwweg tweemaal zoveel klikken',
  }

  it('bewaart wat Meta na afloop terugzei', () => {
    const uitkomst = parseJournalBody('wijziging', {
      ...basis,
      waargenomen: { dailyBudgetMinor: 2000, effectiveStatus: 'ACTIVE' },
    })

    expect(uitkomst.ok).toBe(true)
    expect(uitkomst.ok && (uitkomst.body as { waargenomen?: unknown }).waargenomen).toEqual({
      dailyBudgetMinor: 2000,
      effectiveStatus: 'ACTIVE',
    })
  })

  it('blijft geldig zonder waargenomen, voor een wijziging die je elders deed', () => {
    expect(parseJournalBody('wijziging', basis).ok).toBe(true)
  })
})
