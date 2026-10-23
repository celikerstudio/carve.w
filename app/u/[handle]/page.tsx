import type { Metadata } from 'next'
import Image from 'next/image'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { handleUitUrl } from '@/lib/uitnodiging'
import { lijfVan } from '@/lib/uitnodiging-lijf'
import { marketingPadVoor } from '@/lib/taalvoorkeur'
import { APP_STORE_URL } from '@/lib/utils'

/**
 * De uitnodigingspagina: wat iemand ziet die een link van een Carve-gebruiker opent zonder de
 * app (companion `uitnodigen-1`, de zesde telefoon).
 *
 * @ai-why: Met de app komt niemand hier: iOS opent `/u/<handle>` dan rechtstreeks in Carve
 * (het AASA-bestand). Deze pagina is voor wie de app nog niet heeft, en voor de tijd tot het
 * AASA-bestand live staat. Daarom bovenaan "Open in Carve" via het eigen schema, dan de App
 * Store.
 * @ai-why: Geen database. De handle komt uit de URL en wordt alleen getoond. Zo verraadt de
 * pagina niet of een handle bestaat, en is er geen RLS-vraag om een profiel te lezen dat de
 * bezoeker niet mag zien.
 * @ai-why: Het lijf is dat van wie uitnodigde als die het ooit deelde, anders een personage van
 * Carve (`lib/uitnodiging-lijf.ts`).
 * @ai-why: Na een installatie via de App Store weet de app niet wie uitnodigde (ADR-098 §2,
 * bewust). De handle staat daarom in de tekst onder de knoppen: zoek @furkan.
 * @ai-sync: lib/uitnodiging.ts
 * @ai-sync: ~/Developer/Carve-AI/docs/decisions/ADR-098-uitnodigen-met-een-echte-link.md
 */

type Props = { params: Promise<{ handle: string }> }

const TEKST = {
  en: {
    title: (h: string) => `@${h} invites you`,
    body: "Train together, see each other's steps and workouts, and pass each other every month.",
    open: 'Open in Carve',
    search: (h: string) => `No app yet? After installing, search for @${h} to become friends.`,
    meta: (h: string) => `Train with @${h} on Carve`,
  },
  nl: {
    title: (h: string) => `@${h} nodigt je uit`,
    body: 'Train samen, zie elkaars stappen en trainingen, en ga elkaar elke maand voorbij.',
    open: 'Open in Carve',
    search: (h: string) => `Nog geen app? Zoek na het installeren op @${h} om vrienden te worden.`,
    meta: (h: string) => `Train met @${h} op Carve`,
  },
} as const

async function taal(): Promise<'nl' | 'en'> {
  // Dezelfde keuze als de wortel van de site (TDR-0015).
  return marketingPadVoor((await headers()).get('accept-language')) === '/nl/app' ? 'nl' : 'en'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const handle = handleUitUrl((await params).handle)
  if (!handle) return {}
  const t = TEKST[await taal()]
  return {
    title: t.meta(handle),
    description: t.body,
    // @ai-why: Geen index. Een pagina per gebruiker in Google zet handles op straat.
    robots: { index: false, follow: false },
    // @ai-why: Het beeld komt uit `opengraph-image.tsx` hiernaast, altijd, ook voor wie nooit
    //   deelde. Tot 2026-10-23 stond hier alleen het eigen lijf als dat bestond: zonder lijf
    //   had de link in WhatsApp geen enkel plaatje, en mét was het een staande strook van
    //   265 bij 640 die WhatsApp als klein vierkantje toont.
    // @ai-why: Twitter-velden expliciet, anders erft de link "Carve AI — Fitness Coach" van de
    //   wortel van de site naast een titel die over de uitnodiging gaat.
    openGraph: { title: t.meta(handle), description: t.body },
    twitter: { card: 'summary_large_image', title: t.meta(handle), description: t.body },
  }
}

export default async function UitnodigingPagina({ params }: Props) {
  const handle = handleUitUrl((await params).handle)
  if (!handle) notFound()
  const t = TEKST[await taal()]
  const lijf = await lijfVan(handle)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0B] px-6 py-16 text-white">
      {/* `unoptimized`: het plaatje wordt bij elke deling overschreven, en de optimizer van Next
          zou de oude versie langer vasthouden dan de vijf minuten hierboven. */}
      <Image src={lijf ?? '/uitnodiging-lijf.png'} alt="" width={266} height={640} priority unoptimized={!!lijf}
             className="h-[260px] w-auto" />
      <h1 className="mt-8 text-center text-[32px] font-bold leading-tight tracking-[-0.02em]">{t.title(handle)}</h1>
      <p className="mt-3 max-w-[360px] text-center text-[16px] leading-relaxed text-white/60">{t.body}</p>

      <a
        href={`carveai://u/${handle}`}
        className="mt-10 w-full max-w-[320px] rounded-2xl bg-white py-4 text-center text-[16px] font-semibold text-black"
      >
        {t.open}
      </a>
      {/* Apple's badge-artwork, ongewijzigd (zie components/carve/AppStoreButton.tsx). */}
      <a href={APP_STORE_URL} className="mt-4" aria-label="Download on the App Store">
        <Image src="/app-store-badge.svg" alt="Download on the App Store" width={180} height={60} className="h-[54px] w-auto" />
      </a>
      <p className="mt-6 max-w-[320px] text-center text-[13px] leading-relaxed text-white/40">{t.search(handle)}</p>
    </main>
  )
}
