import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { handleUitUrl } from '@/lib/uitnodiging'
import { lijfVan } from '@/lib/uitnodiging-lijf'

/**
 * Het beeld bij een uitnodigingslink: het lijf van wie uitnodigde, met de @handle ernaast.
 *
 * @ai-why: Liggend, op 1200 bij 630. WhatsApp toont alleen een liggend beeld groot boven het
 * bericht. Het lijf alleen (265 bij 640) werd een klein vierkantje naast de tekst, en wie nooit
 * deelde had helemaal geen plaatje.
 * @ai-why: Geen zin in het beeld, alleen de handle. De scraper van WhatsApp stuurt geen
 * taalvoorkeur mee, dus een zin zou altijd Engels zijn. De titel eronder komt uit de metadata
 * van de pagina en volgt wél de taal.
 * @ai-gotcha: Elk element met meer dan één kind heeft `display: flex` nodig (Satori), en vet
 * bestaat hier niet zonder eigen font-data (zie `app/opengraph-image.tsx`).
 * @ai-sync: app/u/[handle]/page.tsx
 */
export const alt = 'Carve'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Props = { params: Promise<{ handle: string }> }

/** Het standaardlijf als data-URL, want Satori kan geen relatief pad openen. */
async function standaardLijf(): Promise<string> {
  const png = await readFile(join(process.cwd(), 'public', 'uitnodiging-lijf.png'))
  return `data:image/png;base64,${png.toString('base64')}`
}

export default async function UitnodigingBeeld({ params }: Props) {
  const handle = handleUitUrl((await params).handle) ?? 'carve'
  const lijf = (await lijfVan(handle)) ?? (await standaardLijf())
  // @ai-why: Een handle mag 20 tekens zijn. Op 92 px loopt die uit de 670 px naast het lijf;
  //   een teken is in dit lettertype ruwweg 0,56 em breed.
  const handleSize = Math.min(92, Math.floor(670 / ((handle.length + 1) * 0.56)))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#0A0A0B',
          padding: '0 110px',
          color: '#ffffff',
        }}
      >
        {/* 265:640, de verhouding van elk lijf dat de app tekent. */}
        <img src={lijf} width={220} height={531} alt="" style={{ objectFit: 'contain' }} />
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 90 }}>
          <div style={{ display: 'flex', fontSize: 30, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.55)' }}>
            CARVE
          </div>
          <div style={{ display: 'flex', fontSize: handleSize, marginTop: 18, letterSpacing: '-0.02em' }}>@{handle}</div>
          <div style={{ display: 'flex', fontSize: 30, marginTop: 22, color: 'rgba(255,255,255,0.45)' }}>
            carve.wiki
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
