/**
 * Het personage van wie uitnodigde, of null als die het nooit deelde.
 *
 * @ai-why: De app zet het bij elke deling in de publieke bucket `invite-looks` (Carve-AI,
 * `InviteLook.swift`). Een plaatje dat er staat is door de eigenaar zelf gedeeld, dus het
 * tonen zegt niets dat hij niet zelf verstuurde.
 * @ai-why: Een eigen bestand en niet in `uitnodiging.ts`, want dat bestand is puur en getest,
 * en dit gaat het netwerk op. De pagina en het deelbeeld lezen allebei hier.
 * @ai-sync: app/u/[handle]/page.tsx
 * @ai-sync: app/u/[handle]/opengraph-image.tsx
 */
export async function lijfVan(handle: string): Promise<string | null> {
  const basis = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!basis) return null
  const url = `${basis}/storage/v1/object/public/invite-looks/${handle}.png`
  try {
    // @ai-why: Vijf minuten vasthouden, net als de cache-control die de app meegeeft. Een nieuw
    //   lijf staat er dan binnen een paar minuten, zonder dat elke bezoeker Supabase raakt.
    const antwoord = await fetch(url, { method: 'HEAD', next: { revalidate: 300 } })
    return antwoord.ok ? url : null
  } catch {
    return null
  }
}
