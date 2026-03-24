'use client'

import { createContext, useContext } from 'react'
import { useWikiMetadata, type WikiArticleMeta, type WikiCategory } from '@/hooks/useWikiMetadata'

interface WikiMetadataContextValue {
  articles: WikiArticleMeta[]
  categories: WikiCategory[]
  loading: boolean
  getArticle: (slug: string) => WikiArticleMeta | undefined
}

const WikiMetadataContext = createContext<WikiMetadataContextValue>({
  articles: [],
  categories: [],
  loading: true,
  getArticle: () => undefined,
})

export function WikiMetadataProvider({ children }: { children: React.ReactNode }) {
  const { articles, categories, loading } = useWikiMetadata()

  const getArticle = (slug: string) => articles.find((a) => a.slug === slug)

  return (
    <WikiMetadataContext.Provider value={{ articles, categories, loading, getArticle }}>
      {children}
    </WikiMetadataContext.Provider>
  )
}

export function useWikiMeta() {
  return useContext(WikiMetadataContext)
}
