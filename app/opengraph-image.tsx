import { ImageResponse } from 'next/og'

// @ai-why: Er was geen opengraph-image, dus een gedeelde link naar carve.wiki liet in
// Slack, iMessage en WhatsApp alleen de kale URL zien. Dat is precies de plek waar de
// eerste indruk gratis is en waar een advertentie-euro niet aan hoeft te worden besteed.
//
// @ai-why: Gegenereerd met `next/og` en niet als PNG in `public/`. Een PNG veroudert
// stil zodra de belofte verandert — dit bestand draagt de belofte als tekst, dus een
// wijziging is een diff die je kunt lezen en niet een binair bestand dat iemand moet
// naexporteren. Kosten zijn nul: Next rendert hem één keer en cachet hem.
//
// @ai-gotcha: Satori (de renderer achter ImageResponse) synthetiseert geen vet. Er is
// hier bewust geen `fontWeight` gezet: het meegeleverde standaardlettertype heeft
// alleen weight 400, en een `fontWeight: 700` levert dan gewoon weight 400 op zonder
// dat er iets faalt. Wil je écht vet, dan moet je font-data meegeven aan `ImageResponse`.
//
// @ai-gotcha: Elk element met meer dan één kind heeft een expliciete `display: flex`
// nodig; Satori gooit anders een fout. Dat is geen stijlkeuze maar een eis.
//
// @ai-sync: ~/Developer/Carve-AI/docs/marketing/app-store-listing.md — dezelfde belofte
// als de promotional text. Verandert die, dan verandert deze mee.
export const alt = 'Carve — logs your food from a photo, tracks the muscles you skip'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0c0e14',
          padding: '72px 80px',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 40,
            letterSpacing: '0.32em',
            color: 'rgba(255,255,255,0.92)',
          }}
        >
          CARVE
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginTop: 8,
          }}
        >
          <div style={{ display: 'flex', fontSize: 66, lineHeight: 1.18 }}>
            Logs your food from a photo.
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 66,
              lineHeight: 1.18,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            Tracks the muscles you skip.
          </div>
        </div>

        <div style={{ display: 'flex', height: 1, backgroundColor: 'rgba(255,255,255,0.12)' }} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 28,
            fontSize: 27,
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          <div style={{ display: 'flex' }}>Built by someone who lost 50kg using it.</div>
          <div style={{ display: 'flex' }}>iPhone · carve.wiki</div>
        </div>
      </div>
    ),
    size,
  )
}
