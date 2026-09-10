import { describe, expect, it } from 'vitest'
import { appendEvent, toJournalEvent, type JournalRow } from './journal-store'

function databaserij(over: Partial<JournalRow> = {}): JournalRow {
  return {
    id: 'a1',
    at: '2026-09-10T09:00:00.000Z',
    kind: 'wijziging',
    campaign_id: '120210000000001',
    body: { wat: 'budget omhoog', waarom: 'te weinig bereik', verwacht: 'meer klikken' },
    ref: null,
    ...over,
  }
}

/** Een client die alleen onthoudt wat er ingevoegd zou zijn. */
function nepClient() {
  const inserts: unknown[] = []
  return {
    inserts,
    from() {
      return {
        insert(waarde: unknown) {
          inserts.push(waarde)
          return Promise.resolve({ error: null })
        },
      }
    },
  }
}

describe('toJournalEvent', () => {
  it('vertaalt snake_case naar de vorm die de lagen gebruiken', () => {
    const event = toJournalEvent(databaserij())

    expect(event.campaignId).toBe('120210000000001')
    expect(event.kind).toBe('wijziging')
  })

  it('houdt een accountbrede regel op null', () => {
    const event = toJournalEvent(databaserij({ campaign_id: null }))

    expect(event.campaignId).toBeNull()
  })
})

describe('appendEvent', () => {
  it('voegt een geldige gebeurtenis toe', async () => {
    const client = nepClient()

    const uitkomst = await appendEvent(client as never, {
      kind: 'wijziging',
      campaignId: '120210000000001',
      body: { wat: 'budget omhoog', waarom: 'te weinig bereik', verwacht: 'meer klikken' },
    })

    expect(uitkomst.ok).toBe(true)
    expect(client.inserts).toHaveLength(1)
  })

  it('schrijft niets weg als de vorm niet klopt', async () => {
    const client = nepClient()

    const uitkomst = await appendEvent(client as never, {
      kind: 'wijziging',
      campaignId: null,
      body: { wat: 'budget omhoog', waarom: 'te weinig bereik' },
    })

    expect(uitkomst.ok).toBe(false)
    expect(client.inserts).toHaveLength(0)
  })

  it('weigert een afsluiting zonder verwijzing voordat de database eraan te pas komt', async () => {
    const client = nepClient()

    const uitkomst = await appendEvent(client as never, {
      kind: 'afsluiting',
      campaignId: null,
      body: { uitkomst: 'geen verschil', besluit: 'creatief blijft' },
    })

    expect(uitkomst.ok).toBe(false)
    expect(client.inserts).toHaveLength(0)
  })

  it('laat een afsluiting mét verwijzing wel door', async () => {
    const client = nepClient()

    const uitkomst = await appendEvent(client as never, {
      kind: 'afsluiting',
      campaignId: null,
      ref: 'test-1',
      body: { uitkomst: 'geen verschil', besluit: 'creatief blijft' },
    })

    expect(uitkomst.ok).toBe(true)
    expect(client.inserts).toHaveLength(1)
  })
})

describe('readJournal, gaten die de review vond', () => {
  function falendeClient(bericht: string) {
    return {
      from() {
        return {
          select() {
            return {
              order() {
                return {
                  order() {
                    return { limit: () => Promise.resolve({ data: null, error: { message: bericht } }) }
                  },
                }
              },
            }
          },
        }
      },
    }
  }

  it('geeft een fout terug in plaats van een lege lijst', async () => {
    const { readJournal } = await import('./journal-store')

    const uitkomst = await readJournal(falendeClient('permission denied') as never)

    expect(uitkomst.ok).toBe(false)
  })
})

describe('appendEvent, gaten die de review vond', () => {
  it('legt vast wie de regel schreef', async () => {
    const client = nepClient()

    await appendEvent(client as never, {
      kind: 'wijziging',
      campaignId: null,
      createdBy: 'user-1',
      body: { wat: 'budget omhoog', waarom: 'te weinig bereik', verwacht: 'meer klikken' },
    })

    expect((client.inserts[0] as { created_by?: string }).created_by).toBe('user-1')
  })
})
