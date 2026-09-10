import { describe, expect, it } from 'vitest'
import { buildAds, type Ga4Campaign, type MetaCampaign } from './ads'

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

describe('buildAds', () => {
  it('koppelt een GA4-rij aan de campagne met hetzelfde id', () => {
    const { rows } = buildAds([campagne()], [ga4()])

    expect(rows).toHaveLength(1)
    expect(rows[0].visitors).toBe(150)
    expect(rows[0].appStoreClicks).toBe(20)
    expect(rows[0].attribution).toBe('gemeten')
  })

  it('houdt de naam van Meta aan, niet die uit de UTM', () => {
    const { rows } = buildAds([campagne({ name: 'zomer_2026_v2' })], [ga4()])

    expect(rows[0].name).toBe('zomer_2026_v2')
  })

  it('geeft een campagne zonder utm_id in zijn advertenties de status geen-utm', () => {
    const { rows } = buildAds([campagne({ tagged: false })], [])

    expect(rows[0].attribution).toBe('geen-utm')
    expect(rows[0].visitors).toBeNull()
    expect(rows[0].appStoreClicks).toBeNull()
  })

  it('onderscheidt een getagde campagne zonder GA4-rij van een ongetagde', () => {
    const { rows } = buildAds([campagne({ tagged: true })], [])

    expect(rows[0].attribution).toBe('geen-gegevens')
    expect(rows[0].appStoreClicks).toBeNull()
  })

  it('rekent CTR op één decimaal en CPC en CPM op twee', () => {
    const { rows } = buildAds([campagne({ spend: 100, clicks: 200, impressions: 10_000 })], [])

    expect(rows[0].ctr).toBe(2)
    expect(rows[0].cpc).toBe(0.5)
    expect(rows[0].cpm).toBe(10)
  })

  it('geeft null in plaats van een deling door nul', () => {
    const { rows } = buildAds([campagne({ spend: 0, clicks: 0, impressions: 0 })], [ga4({ appStoreClicks: 0 })])

    expect(rows[0].ctr).toBeNull()
    expect(rows[0].cpc).toBeNull()
    expect(rows[0].cpm).toBeNull()
    expect(rows[0].costPerAppStoreClick).toBeNull()
  })

  it('rekent kosten per app-store-klik per campagne', () => {
    const { rows } = buildAds([campagne({ spend: 100 })], [ga4({ appStoreClicks: 20 })])

    expect(rows[0].costPerAppStoreClick).toBe(5)
  })

  it('sorteert op uitgaven, de duurste bovenaan', () => {
    const { rows } = buildAds(
      [
        campagne({ id: '1', spend: 10 }),
        campagne({ id: '2', spend: 90 }),
        campagne({ id: '3', spend: 50 }),
      ],
      [],
    )

    expect(rows.map((r) => r.id)).toEqual(['2', '3', '1'])
  })

  it('negeert GA4-rijen zonder bijpassende campagne', () => {
    const { rows } = buildAds([campagne({ id: '1' })], [ga4({ campaignId: '(not set)' })])

    expect(rows).toHaveLength(1)
    expect(rows[0].attribution).toBe('geen-gegevens')
  })

  it('telt uitgaven, klikken en impressies op over alle campagnes', () => {
    const { totals } = buildAds(
      [campagne({ id: '1', spend: 40, clicks: 100, impressions: 4000 }), campagne({ id: '2', spend: 60, clicks: 150, impressions: 6000 })],
      [],
    )

    expect(totals.spend).toBe(100)
    expect(totals.clicks).toBe(250)
    expect(totals.impressions).toBe(10_000)
  })

  it('rekent de kosten per app-store-klik alleen over campagnes die gemeten zijn', () => {
    const { totals } = buildAds(
      [
        campagne({ id: '1', spend: 100 }),
        campagne({ id: '2', spend: 900, tagged: false }),
      ],
      [ga4({ campaignId: '1', appStoreClicks: 20 })],
    )

    expect(totals.costPerAppStoreClick).toBe(5)
    expect(totals.measuredSpend).toBe(100)
  })

  it('meldt hoeveel uitgaven buiten de meting vallen', () => {
    const { totals } = buildAds(
      [campagne({ id: '1', spend: 100 }), campagne({ id: '2', spend: 900, tagged: false })],
      [ga4({ campaignId: '1' })],
    )

    expect(totals.untaggedSpend).toBe(900)
  })
})
