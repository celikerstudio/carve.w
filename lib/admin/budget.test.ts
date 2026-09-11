import { describe, expect, it } from 'vitest'
import { naarMinorUnit, plafondVan, uitMinorUnit, valutaBekend, zetLeerfaseTerug } from './budget'

describe('valutaBekend', () => {
  it('kent euro', () => {
    expect(valutaBekend('EUR')).toBe(true)
  })

  it('kent een valuta zonder decimalen niet, in plaats van honderd aan te nemen', () => {
    expect(valutaBekend('JPY')).toBe(false)
  })

  it('kent onzin niet', () => {
    expect(valutaBekend('XYZ')).toBe(false)
  })
})

describe('naarMinorUnit', () => {
  it('rekent tien euro om naar duizend', () => {
    expect(naarMinorUnit(10, 'EUR')).toBe(1000)
  })

  it('rondt af op de kleinste eenheid en laat geen halve centen achter', () => {
    expect(naarMinorUnit(10.005, 'EUR')).toBe(1001)
  })

  it('weigert een onbekende valuta in plaats van te gokken', () => {
    expect(() => naarMinorUnit(10, 'JPY')).toThrow(/JPY/)
  })

  it('weigert een negatief bedrag', () => {
    expect(() => naarMinorUnit(-1, 'EUR')).toThrow()
  })
})

describe('uitMinorUnit', () => {
  it('is de omgekeerde van naarMinorUnit', () => {
    expect(uitMinorUnit(naarMinorUnit(12.34, 'EUR'), 'EUR')).toBe(12.34)
  })

  it('weigert een onbekende valuta', () => {
    expect(() => uitMinorUnit(1000, 'JPY')).toThrow(/JPY/)
  })
})

describe('plafondVan', () => {
  it('staat vijftig euro per dag toe', () => {
    expect(naarMinorUnit(50, 'EUR')).toBeLessThanOrEqual(plafondVan('EUR'))
  })

  it('houdt een euro meer tegen', () => {
    expect(naarMinorUnit(51, 'EUR')).toBeGreaterThan(plafondVan('EUR'))
  })

  it('weigert een onbekende valuta', () => {
    expect(() => plafondVan('JPY')).toThrow(/JPY/)
  })
})

describe('zetLeerfaseTerug', () => {
  it('zwijgt bij een kleine bijstelling', () => {
    expect(zetLeerfaseTerug(1000, 1100)).toBe(false)
  })

  it('slaat aan op precies de drempel', () => {
    expect(zetLeerfaseTerug(1000, 1200)).toBe(true)
  })

  it('slaat ook aan bij een verlaging van dezelfde omvang', () => {
    expect(zetLeerfaseTerug(1000, 800)).toBe(true)
  })

  it('behandelt een campagne die van nul naar een budget gaat als terugzetten', () => {
    expect(zetLeerfaseTerug(0, 1000)).toBe(true)
  })

  it('zegt niets over nul naar nul', () => {
    expect(zetLeerfaseTerug(0, 0)).toBe(false)
  })
})
