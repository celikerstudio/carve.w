'use client'

import { useEffect, useState } from 'react'
import { appStoreCampaignUrl } from '@/lib/app-store-link'
import { APP_STORE_URL } from '@/lib/utils'

/**
 * De App Store-link, met de campagne erin als de bezoeker via een advertentie kwam.
 *
 * @ai-why: In een effect en niet tijdens het renderen. De server kent de query-string van
 * de bezoeker niet, dus de eerste render moet de kale link opleveren; anders wijkt de
 * HTML van de server af van die van de client en gooit React de hydratie weg.
 *
 * @ai-gotcha: Leest alleen de URL van de pagina waar de bezoeker nú staat. Klikt iemand
 * eerst door naar een andere pagina, dan zijn de parameters weg en vertrekt hij zonder
 * campagne naar de App Store. Bewaren in `sessionStorage` zou dat oplossen, maar dat is
 * opslag op het apparaat van de bezoeker en die vraag hoort bij de cookiebanner
 * (lib/consent.ts), niet hier. De advertentieknop staat op de landingspagina zelf, dus
 * het gat is klein.
 *
 * @ai-sync: lib/app-store-link.ts
 * @ai-sync: docs/tdr/0009-campagnerendement-komt-uit-ga4.md
 */
export function useAppStoreUrl(): string {
  const [url, setUrl] = useState(APP_STORE_URL)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    // @ai-why: Liever de naam dan het id. Dit cijfer lees je met het oog in App Store
    // Connect, en daar is `zomer2026` bruikbaar en `120210000000001` niet.
    const campagne = params.get('utm_campaign') ?? params.get('utm_id')

    setUrl(
      appStoreCampaignUrl(
        APP_STORE_URL,
        campagne,
        process.env.NEXT_PUBLIC_APPSTORE_PROVIDER_TOKEN,
      ),
    )
  }, [])

  return url
}
