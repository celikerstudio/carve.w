import { describe, expect, it } from 'vitest'
import { parseCampaigns, taggedCampaignIds } from './meta'

describe('parseCampaigns', () => {
  it('leest de bedragen en tellingen als getal, want Meta stuurt strings', () => {
    const campagnes = parseCampaigns({
      data: [
        {
          campaign_id: '120210000000001',
          campaign_name: 'zomer_2026',
          spend: '123.45',
          clicks: '200',
          impressions: '10000',
        },
      ],
    })

    expect(campagnes).toEqual([
      {
        id: '120210000000001',
        name: 'zomer_2026',
        spend: 123.45,
        clicks: 200,
        impressions: 10_000,
      },
    ])
  })

  it('geeft een lege lijst als er geen campagnes liepen', () => {
    // @ai-why: Meta stuurt dan een lege `data`-array, geen rij met nullen.
    expect(parseCampaigns({ data: [] })).toEqual([])
    expect(parseCampaigns({})).toEqual([])
  })

  it('vult ontbrekende cijfers met nul in plaats van NaN', () => {
    const [campagne] = parseCampaigns({
      data: [{ campaign_id: '1', campaign_name: 'test' }],
    })

    expect(campagne.spend).toBe(0)
    expect(campagne.clicks).toBe(0)
    expect(campagne.impressions).toBe(0)
  })
})

describe('taggedCampaignIds', () => {
  it('ziet een campagne als getagd zodra één advertentie utm_id meestuurt', () => {
    const ids = taggedCampaignIds({
      data: [
        { campaign_id: '1', creative: { url_tags: 'utm_source=facebook&utm_id={{campaign.id}}' } },
      ],
    })

    expect(ids.has('1')).toBe(true)
  })

  it('telt url_tags zonder utm_id niet als getagd', () => {
    // @ai-why: utm_campaign alleen is niet genoeg. De koppeling gaat op id; een naam in
    // de tags geeft een rij in GA4 die we niet kunnen matchen.
    const ids = taggedCampaignIds({
      data: [{ campaign_id: '1', creative: { url_tags: 'utm_campaign=zomer_2026' } }],
    })

    expect(ids.has('1')).toBe(false)
  })

  it('overleeft een advertentie zonder creative of zonder url_tags', () => {
    const ids = taggedCampaignIds({
      data: [{ campaign_id: '1' }, { campaign_id: '2', creative: {} }],
    })

    expect(ids.size).toBe(0)
  })

  it('houdt de campagne getagd als één van meerdere advertenties de tag mist', () => {
    const ids = taggedCampaignIds({
      data: [
        { campaign_id: '1', creative: { url_tags: 'utm_id={{campaign.id}}' } },
        { campaign_id: '1', creative: { url_tags: '' } },
      ],
    })

    expect(ids.has('1')).toBe(true)
  })
})
