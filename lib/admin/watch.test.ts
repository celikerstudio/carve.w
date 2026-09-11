import { describe, expect, it } from 'vitest'
import type { AdCampaignRow, Ga4Campaign, MetaCampaign } from './ads'
import type { JournalEvent } from './journal'
import { buildWatchRun } from './watch'

function meta(over: Partial<MetaCampaign> = {}): MetaCampaign {
  return {
    id: '120210000000001',
    name: 'zomer_2026',
    spend: 100,
    clicks: 200,
    impressions: 10_000,
    tagged: true,
    ...over,
  }
}

function ga4(over: Partial<Ga4Campaign> = {}): Ga4Campaign {
  return { campaignId: '120210000000001', visitors: 150, appStoreClicks: 20, ...over }
}

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

function invoer(over: Partial<Parameters<typeof buildWatchRun>[0]> = {}) {
  return {
    campaigns: [meta()],
    ga4Rows: [ga4()],
    huidig: [rij()],
    vorig: [rij()],
    bezoekersTotaal: 400,
    appStoreClicksTotaal: 20,
    journaal: [] as JournalEvent[] | null,
    venster: { van: '2026-09-01', tot: '2026-09-15' },
    vandaag: '2026-09-15',
    ...over,
  }
}

describe('buildWatchRun', () => {
  it('legt de eerste controle vast', () => {
    const run = buildWatchRun(invoer())

    expect(run.events.filter((e) => e.kind === 'controle')).toHaveLength(1)
  })

  it('legt geen tweede controle vast als er niets veranderde', () => {
    const eerdere: JournalEvent = {
      id: 'c1',
      at: '2026-09-14T09:00:00.000Z',
      kind: 'controle',
      campaignId: null,
      body: { status: 'goed', bevindingen: [] },
      ref: null,
    }

    const run = buildWatchRun(invoer({ journaal: [eerdere] }))

    expect(run.events.filter((e) => e.kind === 'controle')).toHaveLength(0)
  })

  it('legt wel vast zodra de controle van goed naar fout gaat', () => {
    const eerdere: JournalEvent = {
      id: 'c1',
      at: '2026-09-14T09:00:00.000Z',
      kind: 'controle',
      campaignId: null,
      body: { status: 'goed', bevindingen: [] },
      ref: null,
    }

    const run = buildWatchRun(
      invoer({ journaal: [eerdere], campaigns: [meta({ tagged: false })], ga4Rows: [] }),
    )

    expect(run.events.filter((e) => e.kind === 'controle')).toHaveLength(1)
    expect(run.check.status).toBe('fout')
  })

  it('schrijft nooit zelf een afsluiting weg', () => {
    const test: JournalEvent = {
      id: 'test-1',
      at: '2026-09-01T09:00:00.000Z',
      kind: 'test',
      campaignId: '120210000000001',
      body: {
        hypothese: 'h',
        variabele: 'creatief',
        verwacht: 'meer',
        criterium: 'een kwart hoger',
        startte: '2026-09-01',
        loopttot: '2026-09-15',
      },
      ref: null,
    }

    const run = buildWatchRun(invoer({ journaal: [test] }))

    expect(run.conclusies).toHaveLength(1)
    expect(run.events.some((e) => e.kind === 'afsluiting')).toBe(false)
  })

  it('legt een voorstel vast dat uit een signaal volgt', () => {
    const kaal = rij({ spend: 80, appStoreClicks: 0, costPerAppStoreClick: null })

    const run = buildWatchRun(invoer({ huidig: [kaal], vorig: [kaal] }))

    expect(run.events.filter((e) => e.kind === 'voorstel')).toHaveLength(1)
  })

  it('herhaalt een voorstel niet dat al in het journaal staat', () => {
    const kaal = rij({ spend: 80, appStoreClicks: 0, costPerAppStoreClick: null })
    const eerder: JournalEvent = {
      id: 'v1',
      at: '2026-09-14T09:00:00.000Z',
      kind: 'voorstel',
      campaignId: '120210000000001',
      body: { actie: 'Campagne zomer_2026 pauzeren', motivatie: 'x', onderbouwing: { spend: 80 } },
      ref: null,
    }

    const run = buildWatchRun(invoer({ huidig: [kaal], vorig: [kaal], journaal: [eerder] }))

    expect(run.events.filter((e) => e.kind === 'voorstel')).toHaveLength(0)
  })

  it('levert alleen gebeurtenissen op die het journaal accepteert', async () => {
    const { validateEvent } = await import('./journal')
    const kaal = rij({ spend: 80, appStoreClicks: 0, costPerAppStoreClick: null })

    const run = buildWatchRun(invoer({ huidig: [kaal], vorig: [kaal] }))

    for (const event of run.events) {
      const uitkomst = validateEvent({
        id: 'nieuw',
        at: '2026-09-15T09:00:00.000Z',
        ref: null,
        ...event,
      })
      expect(uitkomst.ok, JSON.stringify(uitkomst)).toBe(true)
    }
  })
})

describe('buildWatchRun, gaten die de review vond', () => {
  it('schrijft niets weg als het journaal niet gelezen kon worden', () => {
    const kaal = rij({ spend: 80, appStoreClicks: 0, costPerAppStoreClick: null })

    const run = buildWatchRun(invoer({ huidig: [kaal], vorig: [kaal], journaal: null }))

    expect(run.events).toEqual([])
    expect(run.journaalGelezen).toBe(false)
  })

  it('herhaalt een voorstel wel als het buiten het herhaalvenster valt', () => {
    const kaal = rij({ spend: 80, appStoreClicks: 0, costPerAppStoreClick: null })
    const oud: JournalEvent = {
      id: 'v1',
      at: '2026-01-01T09:00:00.000Z',
      kind: 'voorstel',
      campaignId: '120210000000001',
      body: { actie: 'Campagne zomer_2026 pauzeren', motivatie: 'x', onderbouwing: { spend: 80 } },
      ref: null,
    }

    const run = buildWatchRun(invoer({ huidig: [kaal], vorig: [kaal], journaal: [oud] }))

    expect(run.events.filter((e) => e.kind === 'voorstel')).toHaveLength(1)
  })
})
