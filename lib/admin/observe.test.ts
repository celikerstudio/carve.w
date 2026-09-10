import { describe, expect, it } from 'vitest'
import type { AdCampaignRow } from './ads'
import { buildSignals } from './observe'

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
    ...over,
  }
}

describe('buildSignals', () => {
  it('zwijgt als er niets noemenswaardigs veranderde', () => {
    const signalen = buildSignals({ huidig: [rij()], vorig: [rij()] })

    expect(signalen).toEqual([])
  })

  it('meldt een campagne die veel meer is gaan kosten per app-store-klik', () => {
    const signalen = buildSignals({
      huidig: [rij({ costPerAppStoreClick: 12, appStoreClicks: 20 })],
      vorig: [rij({ costPerAppStoreClick: 5, appStoreClicks: 20 })],
    })

    expect(signalen.map((s) => s.code)).toContain('kosten_per_klik_omhoog')
  })

  it('zwijgt over een verslechtering die op te weinig klikken rust', () => {
    const signalen = buildSignals({
      huidig: [rij({ costPerAppStoreClick: 12, appStoreClicks: 2 })],
      vorig: [rij({ costPerAppStoreClick: 5, appStoreClicks: 1 })],
    })

    expect(signalen.map((s) => s.code)).not.toContain('kosten_per_klik_omhoog')
  })

  it('noemt het blokkerend als een campagne uitgeeft zonder enig resultaat', () => {
    const signalen = buildSignals({
      huidig: [rij({ spend: 80, appStoreClicks: 0, costPerAppStoreClick: null })],
      vorig: [rij({ spend: 80, appStoreClicks: 0, costPerAppStoreClick: null })],
    })

    const signaal = signalen.find((s) => s.code === 'uitgaven_zonder_resultaat')
    expect(signaal?.ernst).toBe('blokkerend')
  })

  it('zwijgt over uitgaven zonder resultaat als de campagne nauwelijks geld kostte', () => {
    const signalen = buildSignals({
      huidig: [rij({ spend: 3, appStoreClicks: 0, costPerAppStoreClick: null })],
      vorig: [rij({ spend: 3, appStoreClicks: 0, costPerAppStoreClick: null })],
    })

    expect(signalen.map((s) => s.code)).not.toContain('uitgaven_zonder_resultaat')
  })

  it('meldt een campagne die nieuw is sinds de vorige periode', () => {
    const signalen = buildSignals({
      huidig: [rij({ id: 'nieuw', name: 'winter_2026' })],
      vorig: [],
    })

    const signaal = signalen.find((s) => s.code === 'nieuwe_campagne')
    expect(signaal?.boodschap).toContain('winter_2026')
  })

  it('meldt een campagne die stilviel', () => {
    const signalen = buildSignals({
      huidig: [rij({ spend: 0, impressions: 0, clicks: 0 })],
      vorig: [rij({ spend: 100 })],
    })

    expect(signalen.map((s) => s.code)).toContain('campagne_stilgevallen')
  })

  it('zet het ernstigste signaal bovenaan', () => {
    const signalen = buildSignals({
      huidig: [
        rij({ id: 'a', name: 'a', spend: 80, appStoreClicks: 0, costPerAppStoreClick: null }),
        rij({ id: 'b', name: 'b' }),
      ],
      vorig: [rij({ id: 'a', name: 'a', spend: 80, appStoreClicks: 0, costPerAppStoreClick: null })],
    })

    expect(signalen[0].ernst).toBe('blokkerend')
  })
})

describe('buildSignals, gaten die de review vond', () => {
  it('meldt een nieuwe campagne die uitgeeft zonder resultaat als blokkerend', () => {
    const signalen = buildSignals({
      huidig: [rij({ id: 'nieuw', name: 'winter_2026', spend: 500, appStoreClicks: 0, costPerAppStoreClick: null })],
      vorig: [],
    })

    const signaal = signalen.find((s) => s.code === 'uitgaven_zonder_resultaat')
    expect(signaal?.ernst).toBe('blokkerend')
  })

  it('houdt nul resultaat en niet gemeten uit elkaar', () => {
    const nietGemeten = rij({
      spend: 80,
      visitors: null,
      appStoreClicks: null,
      costPerAppStoreClick: null,
      attribution: 'geen-gegevens',
    })

    const signalen = buildSignals({ huidig: [nietGemeten], vorig: [nietGemeten] })

    expect(signalen.map((s) => s.code)).not.toContain('uitgaven_zonder_resultaat')
  })

  it('meldt uitgaven op een campagne die buiten de meting valt apart', () => {
    const nietGetagd = rij({
      spend: 80,
      visitors: null,
      appStoreClicks: null,
      costPerAppStoreClick: null,
      attribution: 'geen-utm',
    })

    const signalen = buildSignals({ huidig: [nietGetagd], vorig: [nietGetagd] })

    expect(signalen.map((s) => s.code)).toContain('uitgaven_buiten_meting')
  })
})
