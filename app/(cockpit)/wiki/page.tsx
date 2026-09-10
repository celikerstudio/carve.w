'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { WikiArticleView } from '@/components/wiki/chat/WikiArticleView'
import { WikiCategoryView } from '@/components/wiki/chat/WikiCategoryView'

/**
 * De Wiki-modus, met de staat in de URL.
 *
 * @ai-why: Categorie en artikel staan in de query en niet in React-state. Tot 2026-09-10
 * hield de schil ze vast en deed hij er zelf `history.pushState` bij, naast Next's eigen
 * routering. Gevolg: de terugknop werkte in de wiki half en nergens anders, en een link
 * naar een artikel bestond niet.
 *
 * @ai-gotcha: `useSearchParams` dwingt een Suspense-grens af bij het bouwen. Zonder de
 * wrapper hieronder faalt `next build` op deze pagina met een melding over prerendering
 * die niets over de query zegt.
 *
 * @ai-sync: components/chat/CockpitShell.tsx (de artikelklik in de chat linkt hierheen)
 */
function WikiModus() {
  const router = useRouter()
  const params = useSearchParams()
  const artikel = params.get('artikel')
  const categorie = params.get('categorie')

  function openArtikel(slug: string) {
    router.push(`/wiki?artikel=${encodeURIComponent(slug)}`)
  }

  if (artikel) {
    return (
      <WikiArticleView
        slug={artikel}
        onBack={() => router.push(categorie ? `/wiki?categorie=${encodeURIComponent(categorie)}` : '/wiki')}
        onArticleClick={openArtikel}
      />
    )
  }

  return (
    <WikiCategoryView
      category={categorie}
      onArticleClick={openArtikel}
      onCategoryChange={(cat) =>
        router.push(cat ? `/wiki?categorie=${encodeURIComponent(cat)}` : '/wiki')
      }
      onBackToChat={() => router.push('/')}
    />
  )
}

export default function WikiPage() {
  return (
    <Suspense fallback={null}>
      <WikiModus />
    </Suspense>
  )
}
