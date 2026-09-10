import { describe, expect, it } from 'vitest'
import type { Ga4Campaign, MetaCampaign } from './ads'
import { buildTrackingCheck } from './tracking-check'

function campagne(over: Partial<MetaCampaign> = {}): MetaCampaign {
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
  return {
    campaignId: '120210000000001',
    visitors: 150,
    appStoreClicks: 20,
    ...over,
  }
}

describe('buildTrackingCheck', () => {
  it('noemt een lopende campagne zonder utm_id blokkerend', () => {
    const check = buildTrackingCheck({
      campaigns: [campagne({ tagged: false })],
      ga4Rows: [],
      bezoekersTotaal: 150,
      appStoreClicksTotaal: 20,
    })

    expect(check.status).toBe('fout')
    expect(check.bevindingen).toHaveLength(1)
    expect(check.bevindingen[0].code).toBe('utm_id_ontbreekt')
    expect(check.bevindingen[0].ernst).toBe('blokkerend')
  })

  it('noemt de campagne bij naam, zodat je weet waar je moet zijn', () => {
    const check = buildTrackingCheck({
      campaigns: [campagne({ tagged: false, name: 'winter_2026' })],
      ga4Rows: [],
      bezoekersTotaal: 150,
      appStoreClicksTotaal: 20,
    })

    expect(check.bevindingen[0].boodschap).toContain('winter_2026')
  })

  it('laat een campagne zonder uitgaven met rust, ook zonder utm_id', () => {
    const check = buildTrackingCheck({
      campaigns: [campagne({ tagged: false, spend: 0, clicks: 0, impressions: 0 })],
      ga4Rows: [],
      bezoekersTotaal: 150,
      appStoreClicksTotaal: 20,
    })

    expect(check.status).toBe('goed')
  })

  it('waarschuwt als een getagde campagne uitgeeft maar GA4 niets teruggeeft', () => {
    const check = buildTrackingCheck({
      campaigns: [campagne({ tagged: true })],
      ga4Rows: [],
      bezoekersTotaal: 150,
      appStoreClicksTotaal: 20,
    })

    expect(check.status).toBe('waarschuwing')
    expect(check.bevindingen[0].code).toBe('geen_ga4_rij')
    expect(check.bevindingen[0].ernst).toBe('waarschuwing')
  })

  it('noemt het blokkerend als app_store_click accountbreed stil is terwijl er verkeer is', () => {
    const check = buildTrackingCheck({
      campaigns: [campagne()],
      ga4Rows: [ga4({ appStoreClicks: 0 })],
      bezoekersTotaal: 150,
      appStoreClicksTotaal: 0,
    })

    expect(check.status).toBe('fout')
    expect(check.bevindingen.map((b) => b.code)).toContain('app_store_click_stil')
  })

  it('zwijgt over app_store_click als er nog geen bezoekers zijn', () => {
    const check = buildTrackingCheck({
      campaigns: [campagne()],
      ga4Rows: [ga4({ visitors: 0, appStoreClicks: 0 })],
      bezoekersTotaal: 0,
      appStoreClicksTotaal: 0,
    })

    expect(check.bevindingen.map((b) => b.code)).not.toContain('app_store_click_stil')
  })

  it('geeft status goed en geen bevindingen als alles klopt', () => {
    const check = buildTrackingCheck({
      campaigns: [campagne()],
      ga4Rows: [ga4()],
      bezoekersTotaal: 150,
      appStoreClicksTotaal: 20,
    })

    expect(check.status).toBe('goed')
    expect(check.bevindingen).toEqual([])
  })

  it('levert een body op die het journaal accepteert', async () => {
    const { parseJournalBody } = await import('./journal')
    const check = buildTrackingCheck({
      campaigns: [campagne({ tagged: false })],
      ga4Rows: [],
      bezoekersTotaal: 150,
      appStoreClicksTotaal: 20,
    })

    expect(parseJournalBody('controle', check).ok).toBe(true)
  })
})

describe('buildTrackingCheck, gaten die de review vond', () => {
  it('merkt een stil app_store_click op ook als er nog geen campagnes zijn', () => {
    const check = buildTrackingCheck({
      campaigns: [],
      ga4Rows: [],
      bezoekersTotaal: 400,
      appStoreClicksTotaal: 0,
    })

    expect(check.bevindingen.map((b) => b.code)).toContain('app_store_click_stil')
  })

  it('gebruikt het accountbrede bezoekerstotaal en niet de som van de campagnerijen', () => {
    const check = buildTrackingCheck({
      campaigns: [campagne()],
      ga4Rows: [ga4({ visitors: 150, appStoreClicks: 0 })],
      bezoekersTotaal: 0,
      appStoreClicksTotaal: 0,
    })

    expect(check.bevindingen.map((b) => b.code)).not.toContain('app_store_click_stil')
  })
})
