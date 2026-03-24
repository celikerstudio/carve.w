'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface WikiArticleMeta {
  slug: string
  title: string
  category: string
  tags: string[]
  summary: string
  evidence_rating: string
  type: 'ai' | 'reviewed' | 'original'
  view_count: number
}

export interface WikiCategory {
  name: string
  count: number
}

export function useWikiMetadata() {
  const [articles, setArticles] = useState<WikiArticleMeta[]>([])
  const [categories, setCategories] = useState<WikiCategory[]>([])
  const [loading, setLoading] = useState(true)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    const supabase = createClient()
    supabase
      .from('wiki_articles')
      .select('slug, title, category, tags, summary, evidence_rating, type, view_count')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .then(({ data, error }) => {
        if (error || !data) {
          console.error('[useWikiMetadata] Failed to fetch:', error?.message)
          setLoading(false)
          return
        }

        setArticles(data as WikiArticleMeta[])

        // Derive categories from articles
        const categoryMap = new Map<string, number>()
        for (const a of data) {
          categoryMap.set(a.category, (categoryMap.get(a.category) || 0) + 1)
        }
        const sorted = Array.from(categoryMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
        setCategories(sorted)

        setLoading(false)
      })
  }, [])

  return { articles, categories, loading }
}
