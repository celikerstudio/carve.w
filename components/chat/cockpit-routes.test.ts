import { describe, expect, it } from 'vitest'
import { ADMIN_SECTIONS, adminSectionFromPath, modeFromPath, pathForMode } from './cockpit-routes'

describe('modeFromPath', () => {
  it('leest de modus uit het pad', () => {
    expect(modeFromPath('/')).toBe('carve')
    expect(modeFromPath('/wiki')).toBe('wiki')
    expect(modeFromPath('/hiscores')).toBe('hiscores')
    expect(modeFromPath('/jij')).toBe('brein')
    expect(modeFromPath('/beheer')).toBe('admin')
  })

  it('herkent een sectie onder een modus', () => {
    expect(modeFromPath('/beheer/gebruikers')).toBe('admin')
    expect(modeFromPath('/wiki/creatine')).toBe('wiki')
  })

  it('valt terug op carve bij een onbekend pad', () => {
    expect(modeFromPath('/iets-anders')).toBe('carve')
    expect(modeFromPath('')).toBe('carve')
  })
})

describe('pathForMode', () => {
  it('is de omgekeerde van modeFromPath', () => {
    for (const mode of ['carve', 'wiki', 'hiscores', 'brein', 'admin'] as const) {
      expect(modeFromPath(pathForMode(mode))).toBe(mode)
    }
  })
})

describe('adminSectionFromPath', () => {
  it('vindt elke sectie terug op zijn eigen pad', () => {
    for (const sectie of ADMIN_SECTIONS) {
      expect(adminSectionFromPath(sectie.path)).toBe(sectie.id)
    }
  })

  it('laat /beheer niet elke andere sectie opslokken', () => {
    // @ai-why: /beheer is een prefix van alle andere beheerpaden. Vergelijken in
    // lijstvolgorde zou hier altijd 'overview' opleveren en de zijbalk permanent op
    // Overzicht laten staan, ook als je in Geld zit.
    expect(adminSectionFromPath('/beheer/geld')).toBe('money')
    expect(adminSectionFromPath('/beheer/gebruikers')).toBe('users')
  })

  it('valt terug op het overzicht bij een onbekende sectie', () => {
    expect(adminSectionFromPath('/beheer/bestaat-niet')).toBe('overview')
  })
})
