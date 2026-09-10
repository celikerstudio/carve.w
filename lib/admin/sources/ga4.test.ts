import { describe, expect, it } from 'vitest'
import { parseCampaignRows } from './ga4'

function rapport(rijen: [string, string][]) {
  return {
    rows: rijen.map(([id, waarde]) => ({
      dimensionValues: [{ value: id }],
      metricValues: [{ value: waarde }],
    })),
  }
}

describe('parseCampaignRows', () => {
  it('koppelt bezoekers en app-store-klikken op campagne-id', () => {
    const rijen = parseCampaignRows(rapport([['120210000000001', '150']]), rapport([['120210000000001', '20']]))

    expect(rijen).toEqual([{ campaignId: '120210000000001', visitors: 150, appStoreClicks: 20 }])
  })

  it('geeft nul klikken aan een campagne die alleen in het bezoekersrapport staat', () => {
    const rijen = parseCampaignRows(rapport([['1', '80']]), rapport([]))

    expect(rijen).toEqual([{ campaignId: '1', visitors: 80, appStoreClicks: 0 }])
  })

  it('neemt een campagne mee die alleen in het klikkenrapport staat', () => {
    // @ai-why: Kan niet logisch, wel praktisch: de twee rapporten hebben elk hun eigen
    // drempel bij GA4, dus de ene rij kan wegvallen terwijl de andere blijft staan.
    const rijen = parseCampaignRows(rapport([]), rapport([['1', '3']]))

    expect(rijen).toEqual([{ campaignId: '1', visitors: 0, appStoreClicks: 3 }])
  })

  it('geeft een lege lijst als GA4 geen rijen teruggaf', () => {
    expect(parseCampaignRows({}, {})).toEqual([])
  })
})
