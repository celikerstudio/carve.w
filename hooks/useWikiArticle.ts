'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface WikiArticleFull {
  slug: string
  title: string
  category: string
  tags: string[]
  summary: string
  evidence_rating: string
  type: 'ai' | 'reviewed' | 'original'
  author: string
  reviewers: string[]
  content_html: string
  view_count: number
  needs_update: boolean
  created_at: string
  updated_at: string
}

export interface WikiCitation {
  citation_number: number
  authors: string
  year: number | null
  title: string
  publication: string
  url: string | null
}

interface CacheEntry {
  article: WikiArticleFull
  citations: WikiCitation[]
}

export function useWikiArticle(slug: string | null) {
  const [article, setArticle] = useState<WikiArticleFull | null>(null)
  const [citations, setCitations] = useState<WikiCitation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cache = useRef(new Map<string, CacheEntry>())

  const fetchArticle = useCallback(async (s: string) => {
    // Check cache
    const cached = cache.current.get(s)
    if (cached) {
      setArticle(cached.article)
      setCitations(cached.citations)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const [articleRes, citationsRes] = await Promise.all([
      supabase
        .from('wiki_articles')
        .select('slug, title, category, tags, summary, evidence_rating, type, author, reviewers, content_html, view_count, needs_update, created_at, updated_at')
        .eq('slug', s)
        .eq('is_published', true)
        .single(),
      supabase
        .from('wiki_citations')
        .select('citation_number, authors, year, title, publication, url')
        .eq('article_slug', s)
        .order('citation_number', { ascending: true }),
    ])

    if (articleRes.error || !articleRes.data) {
      setError(articleRes.error?.message || 'Article not found')
      setLoading(false)
      return
    }

    const entry: CacheEntry = {
      article: articleRes.data as WikiArticleFull,
      citations: (citationsRes.data || []) as WikiCitation[],
    }
    cache.current.set(s, entry)

    setArticle(entry.article)
    setCitations(entry.citations)
    setLoading(false)

    // Track view (fire-and-forget)
    fetch('/api/wiki/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: s }),
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!slug) {
      setArticle(null)
      setCitations([])
      setLoading(false)
      return
    }
    fetchArticle(slug)
  }, [slug, fetchArticle])

  return { article, citations, loading, error }
}
