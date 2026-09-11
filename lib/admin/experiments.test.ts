import { describe, expect, it } from 'vitest'
import type { AdCampaignRow } from './ads'
import { buildTestConclusions } from './experiments'
import { parseJournalBody, type JournalEvent } from './journal'

function rij(over: Partial<AdCampaignRow> = {}): AdCampaignRow {
  return {
    id: '120210000000001',
    name: 'zomer_2026',
    spend: 100,
    clicks: 200,
    impressions: 10_000,
    ctr: 2,
    cpc: 0.5,
    cpm: 10,
    visitors: 150,
    appStoreClicks: 20,
    costPerAppStoreClick: 5,
    attribution: 'gemeten',
    dailyBudgetMinor: 2000,
    effectiveStatus: 'ACTIVE',
    ...over,
  }
}

function lopendeTest(over: Partial<JournalEvent> = {}): JournalEvent {
  return {
    id: 'test-1',
    at: '2026-09-01T09:00:00.000Z',
    kind: 'test',
    campaignId: '120210000000001',
    body: {
      hypothese: 'een screenshot met tekst erop klikt beter',
      variabele: 'creatief',
      verwacht: 'hogere doorklikratio',
      criterium: 'doorklikratio minstens een kwart hoger',
      startte: '2026-09-01',
      loopttot: '2026-09-15',
    },
    ref: null,
    ...over,
  }
}

describe('buildTestConclusions', () => {
  it('laat een test die nog loopt met rust', () => {
    const conclusies = buildTestConclusions([lopendeTest()], [rij()], '2026-09-10')

    expect(conclusies).toEqual([])
  })

  it('sluit een test af zodra de einddatum bereikt is', () => {
    const conclusies = buildTestConclusions([lopendeTest()], [rij()], '2026-09-15')

    expect(conclusies).toHaveLength(1)
    expect(conclusies[0].testId).toBe('test-1')
  })

  it('negeert een test die al een afsluiting heeft', () => {
    const afsluiting: JournalEvent = {
      id: 'slot-1',
      at: '2026-09-15T09:00:00.000Z',
      kind: 'afsluiting',
      campaignId: '120210000000001',
      body: { uitkomst: 'geen verschil', besluit: 'terug naar het oude creatief' },
      ref: 'test-1',
    }

    const conclusies = buildTestConclusions([lopendeTest(), afsluiting], [rij()], '2026-09-20')

    expect(conclusies).toEqual([])
  })

  it('draagt de cijfers van de campagne mee', () => {
    const conclusies = buildTestConclusions([lopendeTest()], [rij({ spend: 140 })], '2026-09-15')

    expect(conclusies[0].cijfers.spend).toBe(140)
    expect(conclusies[0].cijfers.appStoreClicks).toBe(20)
  })

  it('zegt erbij wanneer er te weinig volume was om iets te vinden', () => {
    const conclusies = buildTestConclusions(
      [lopendeTest()],
      [rij({ appStoreClicks: 3 })],
      '2026-09-15',
    )

    expect(conclusies[0].genoegVolume).toBe(false)
  })

  it('wijst geen winnaar aan, ook niet bij genoeg volume', () => {
    const conclusies = buildTestConclusions([lopendeTest()], [rij()], '2026-09-15', {
      van: '2026-09-01',
      tot: '2026-09-15',
    })

    expect(conclusies[0].genoegVolume).toBe(true)
    expect(conclusies[0].besluit).toBe('')
  })

  it('sluit ook af als de campagne uit de cijfers verdwenen is', () => {
    const conclusies = buildTestConclusions([lopendeTest()], [], '2026-09-15')

    expect(conclusies).toHaveLength(1)
    expect(conclusies[0].genoegVolume).toBe(false)
    expect(conclusies[0].uitkomst).toContain('niet meer terug')
  })

  it('levert een body op die het journaal accepteert zodra jij het besluit invult', () => {
    const [conclusie] = buildTestConclusions([lopendeTest()], [rij()], '2026-09-15')

    const uitkomst = parseJournalBody('afsluiting', {
      ...conclusie.body,
      besluit: 'creatief blijft staan',
    })

    expect(uitkomst.ok).toBe(true)
  })
})

describe('buildTestConclusions, gaten die de review vond', () => {
  const venster = { van: '2026-09-01', tot: '2026-09-15' }

  it('zegt het erbij als de cijfers een andere periode beslaan dan de test', () => {
    const kort = { van: '2026-09-08', tot: '2026-09-15' }

    const [conclusie] = buildTestConclusions([lopendeTest()], [rij()], '2026-09-15', kort)

    expect(conclusie.dektDeLooptijd).toBe(false)
    expect(conclusie.genoegVolume).toBe(false)
    expect(conclusie.uitkomst).toContain('periode')
  })

  it('laat genoegVolume staan als het venster de looptijd wel dekt', () => {
    const [conclusie] = buildTestConclusions([lopendeTest()], [rij()], '2026-09-15', venster)

    expect(conclusie.dektDeLooptijd).toBe(true)
    expect(conclusie.genoegVolume).toBe(true)
  })
})
