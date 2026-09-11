import { describe, expect, it } from 'vitest'
import type { AdCampaignRow } from './ads'
import { parseJournalBody } from './journal'
import type { Signal } from './observe'
import { buildProposals } from './proposals'
import type { TrackingCheck } from './tracking-check'

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

const metingGoed: TrackingCheck = { status: 'goed', bevindingen: [] }

function signaal(over: Partial<Signal> = {}): Signal {
  return {
    code: 'uitgaven_zonder_resultaat',
    ernst: 'blokkerend',
    campaignId: '120210000000001',
    boodschap: 'gaf uit zonder resultaat',
    ...over,
  }
}

describe('buildProposals', () => {
  it('doet geen enkel voorstel zolang de tracking-check fout staat', () => {
    const check: TrackingCheck = {
      status: 'fout',
      bevindingen: [
        { code: 'app_store_click_stil', ernst: 'blokkerend', boodschap: 'event vuurt niet' },
      ],
    }

    const voorstellen = buildProposals({ signalen: [signaal()], rows: [rij()], check })

    expect(voorstellen).toEqual([])
  })

  it('stelt voor een campagne te pauzeren die uitgeeft zonder resultaat', () => {
    const voorstellen = buildProposals({
      signalen: [signaal()],
      rows: [rij({ spend: 80, appStoreClicks: 0, costPerAppStoreClick: null })],
      check: metingGoed,
    })

    expect(voorstellen).toHaveLength(1)
    expect(voorstellen[0].actie).toContain('pauzeren')
    expect(voorstellen[0].campaignId).toBe('120210000000001')
  })

  it('bevriest de cijfers waarop het voorstel rust', () => {
    const voorstellen = buildProposals({
      signalen: [signaal()],
      rows: [rij({ spend: 80, appStoreClicks: 0, costPerAppStoreClick: null })],
      check: metingGoed,
    })

    expect(voorstellen[0].onderbouwing.spend).toBe(80)
    expect(voorstellen[0].onderbouwing.appStoreClicks).toBe(0)
  })

  it('doet geen voorstel op een signaal dat alleen ter info is', () => {
    const voorstellen = buildProposals({
      signalen: [signaal({ code: 'kosten_per_klik_omlaag', ernst: 'ter-info' })],
      rows: [rij()],
      check: metingGoed,
    })

    expect(voorstellen).toEqual([])
  })

  it('doet geen voorstel over een campagne die niet in de cijfers staat', () => {
    const voorstellen = buildProposals({
      signalen: [signaal({ campaignId: 'verdwenen' })],
      rows: [rij()],
      check: metingGoed,
    })

    expect(voorstellen).toEqual([])
  })

  it('houdt het bij één voorstel per campagne', () => {
    const voorstellen = buildProposals({
      signalen: [signaal(), signaal({ code: 'kosten_per_klik_omhoog', ernst: 'waarschuwing' })],
      rows: [rij({ spend: 80, appStoreClicks: 0, costPerAppStoreClick: null })],
      check: metingGoed,
    })

    expect(voorstellen).toHaveLength(1)
  })

  it('geeft elk voorstel een risico mee', () => {
    const voorstellen = buildProposals({
      signalen: [signaal()],
      rows: [rij({ spend: 80, appStoreClicks: 0, costPerAppStoreClick: null })],
      check: metingGoed,
    })

    expect(voorstellen[0].risico.length).toBeGreaterThan(0)
  })

  it('levert een body op die het journaal accepteert', () => {
    const [voorstel] = buildProposals({
      signalen: [signaal()],
      rows: [rij({ spend: 80, appStoreClicks: 0, costPerAppStoreClick: null })],
      check: metingGoed,
    })

    expect(parseJournalBody('voorstel', voorstel.body).ok).toBe(true)
  })

  it('waarschuwt bij een verslechtering in plaats van meteen te pauzeren', () => {
    const voorstellen = buildProposals({
      signalen: [signaal({ code: 'kosten_per_klik_omhoog', ernst: 'waarschuwing' })],
      rows: [rij({ costPerAppStoreClick: 12 })],
      check: metingGoed,
    })

    expect(voorstellen[0].actie).not.toContain('pauzeren')
  })
})

describe('buildProposals, gaten die de review vond', () => {
  it('doet geen voorstel over een campagne die niet gemeten wordt', () => {
    const nietGemeten = rij({
      spend: 80,
      visitors: null,
      appStoreClicks: null,
      costPerAppStoreClick: null,
      attribution: 'geen-gegevens',
    })

    const voorstellen = buildProposals({
      signalen: [signaal()],
      rows: [nietGemeten],
      check: { status: 'waarschuwing', bevindingen: [{ code: 'geen_ga4_rij', ernst: 'waarschuwing', boodschap: 'x' }] },
    })

    expect(voorstellen).toEqual([])
  })
})
