import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// @ai-why: updateSession praat met Supabase over het netwerk. Wat hier telt is niet of
// die aanroep werkt, maar of de middleware de cookies die hij terugkrijgt doorgeeft aan
// de response die de browser krijgt. Dus: een dubbel dat altijd een ververste cookie zet.
const updateSession = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabase/middleware', () => ({ updateSession }))

const { middleware } = await import('./middleware')

const VERVERST = 'sb-carve-auth-token'

function sessie(user: { id: string } | null) {
  return () => {
    const response = NextResponse.next()
    response.cookies.set(VERVERST, 'nieuw-token', { path: '/' })
    return Promise.resolve({ response, user })
  }
}

beforeEach(() => {
  updateSession.mockReset()
})

describe('middleware geeft de ververste sessiecookie door', () => {
  it('bij de omleiding van / naar /app zonder sessie', async () => {
    updateSession.mockImplementation(sessie(null))

    const res = await middleware(new NextRequest('http://localhost:3000/'))

    expect(res.headers.get('location')).toBe('http://localhost:3000/app')
    expect(res.cookies.get(VERVERST)?.value).toBe('nieuw-token')
  })

  it('bij de omleiding van /login naar / met sessie', async () => {
    updateSession.mockImplementation(sessie({ id: 'furkan' }))

    const res = await middleware(new NextRequest('http://localhost:3000/login'))

    expect(res.headers.get('location')).toBe('http://localhost:3000/')
    expect(res.cookies.get(VERVERST)?.value).toBe('nieuw-token')
  })

  it('bij de omleiding van /signup naar /app', async () => {
    // @ai-why: Dit geval testte tot TDR-0010 de omleiding van /dashboard naar /login. Die
    // route bestaat niet meer en er is geen beschermde route over die naar /login stuurt:
    // de wortel gaat naar /app. Wat het geval bewaakte blijft hetzelfde, namelijk dat de
    // cookie ook deze derde tak overleeft, dus het is verhuisd naar de signup-omleiding.
    // @ai-sync: docs/tdr/0010-het-web-platform-gaat-weg.md
    updateSession.mockImplementation(sessie(null))

    const res = await middleware(new NextRequest('http://localhost:3000/signup'))

    expect(res.headers.get('location')).toBe('http://localhost:3000/app')
    expect(res.cookies.get(VERVERST)?.value).toBe('nieuw-token')
  })
})

// @ai-why: TDR-0015. Alleen de wortel kijkt naar de browsertaal; /app en /nl/app sturen
//   nooit door, zodat een gedeelde link oplevert wat er gedeeld werd.
// @ai-sync: docs/tdr/0015-de-wortel-kiest-de-taal.md
describe('de wortel kiest de taal', () => {
  function verzoek(pad: string, taal?: string) {
    return new NextRequest(`http://localhost:3000${pad}`, taal ? { headers: { 'accept-language': taal } } : undefined)
  }

  it('stuurt een Nederlandse browser zonder sessie naar /nl/app, met de cookie', async () => {
    updateSession.mockImplementation(sessie(null))

    const res = await middleware(verzoek('/', 'nl-NL,nl;q=0.9,en;q=0.8'))

    expect(res.headers.get('location')).toBe('http://localhost:3000/nl/app')
    expect(res.status).toBe(307)
    expect(res.headers.get('vary')).toContain('Accept-Language')
    expect(res.cookies.get(VERVERST)?.value).toBe('nieuw-token')
  })

  it('stuurt een crawler zonder taalvoorkeur naar /app', async () => {
    updateSession.mockImplementation(sessie(null))

    const res = await middleware(verzoek('/'))

    expect(res.headers.get('location')).toBe('http://localhost:3000/app')
  })

  it('laat /app staan, ook voor een Nederlandse browser', async () => {
    updateSession.mockImplementation(sessie(null))

    const res = await middleware(verzoek('/app', 'nl-NL,nl;q=0.9'))

    expect(res.headers.get('location')).toBeNull()
  })

  it('laat een ingelogde bezoeker op de wortel, want daar zit de cockpit', async () => {
    updateSession.mockImplementation(sessie({ id: 'furkan' }))

    const res = await middleware(verzoek('/', 'nl-NL,nl;q=0.9'))

    expect(res.headers.get('location')).toBeNull()
  })
})
