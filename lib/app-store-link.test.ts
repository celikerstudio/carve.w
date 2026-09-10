import { describe, expect, it } from 'vitest'
import { appStoreCampaignUrl } from './app-store-link'

const BASIS = 'https://apps.apple.com/app/carve-ai/id6742664476'

describe('appStoreCampaignUrl', () => {
  it('laat de link met rust als er geen campagne is', () => {
    expect(appStoreCampaignUrl(BASIS, null, 'PROV123')).toBe(BASIS)
  })

  it('laat de link met rust als het providertoken ontbreekt', () => {
    // @ai-why: Apple koppelt een losse `ct` niet aan een campagne. Hem toch meesturen
    // levert een link die eruitziet alsof hij meet en dat niet doet.
    expect(appStoreCampaignUrl(BASIS, '120210000000001', undefined)).toBe(BASIS)
    expect(appStoreCampaignUrl(BASIS, '120210000000001', '')).toBe(BASIS)
  })

  it('zet pt en ct achter de link', () => {
    const url = new URL(appStoreCampaignUrl(BASIS, 'zomer2026', 'PROV123'))

    expect(url.searchParams.get('pt')).toBe('PROV123')
    expect(url.searchParams.get('ct')).toBe('zomer2026')
    expect(url.pathname).toBe('/app/carve-ai/id6742664476')
  })

  it('haalt ook de onderstrepingstekens uit de campagnenaam', () => {
    // @ai-why: Apple documenteert `ct` als alfanumeriek. `zomer_2026` heet bij Apple dus
    // `zomer2026`, terwijl Meta en GA4 de naam met streepje houden. Dat verschil is
    // bewust: een token dat Apple weigert verdwijnt stil uit de rapportage, en dan meet
    // je niets terwijl de link eruitziet alsof hij meet.
    const url = new URL(appStoreCampaignUrl(BASIS, 'zomer_2026', 'PROV123'))

    expect(url.searchParams.get('ct')).toBe('zomer2026')
  })

  it('kapt de campagne af op veertig tekens, want dat is Apple’s limiet', () => {
    const lang = 'a'.repeat(60)
    const url = new URL(appStoreCampaignUrl(BASIS, lang, 'PROV123'))

    expect(url.searchParams.get('ct')).toHaveLength(40)
  })

  it('gooit tekens weg die Apple niet in een campagnetoken accepteert', () => {
    const url = new URL(appStoreCampaignUrl(BASIS, 'zomer 2026 & meer', 'PROV123'))

    expect(url.searchParams.get('ct')).toBe('zomer2026meer')
  })

  it('geeft de kale link terug als er na het opschonen niets overblijft', () => {
    expect(appStoreCampaignUrl(BASIS, '???', 'PROV123')).toBe(BASIS)
  })
})
