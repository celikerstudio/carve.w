'use client'

import { useEffect, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useWikiArticle } from '@/hooks/useWikiArticle'
import { getCategoryColor } from '@/lib/wiki/category-colors'
import { estimateReadTime } from '@/lib/wiki/read-time'

// @ai-why: New component — does NOT reuse ArticleLayout (server component with server-only deps).
// Cherry-picks only client-safe sub-components: EvidenceRating, SourcesList.

const evidenceConfig: Record<string, { label: string; icon: string; color: string }> = {
  'well-established': { label: 'Well-Established', icon: '🟢', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  'emerging-research': { label: 'Emerging Research', icon: '🟡', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  'expert-consensus': { label: 'Expert Consensus', icon: '🔵', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
}

const typeConfig: Record<string, { label: string; color: string }> = {
  ai: { label: 'AI-generated', color: 'bg-white/[0.06] text-white/40 border-white/[0.08]' },
  reviewed: { label: 'Verified', color: 'bg-emerald-500/10 text-emerald-400/70 border-emerald-500/20' },
  original: { label: 'Written by Carve', color: 'bg-blue-500/10 text-blue-400/70 border-blue-500/20' },
}

interface WikiArticleViewProps {
  slug: string
  onBack: () => void
  onArticleClick?: (slug: string) => void
}

export function WikiArticleView({ slug, onBack, onArticleClick }: WikiArticleViewProps) {
  const { article, citations, loading, error } = useWikiArticle(slug)
  const contentRef = useRef<HTMLDivElement>(null)

  // Scroll to top when article changes
  useEffect(() => {
    contentRef.current?.scrollTo(0, 0)
  }, [slug])

  // Handle internal [[slug]] links in article HTML
  useEffect(() => {
    if (!contentRef.current || !onArticleClick) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (!link) return

      const href = link.getAttribute('href')
      if (href && href.startsWith('/wiki/')) {
        e.preventDefault()
        // Extract slug from /wiki/category/slug
        const parts = href.split('/')
        const articleSlug = parts[parts.length - 1]
        if (articleSlug) onArticleClick(articleSlug)
      }
    }

    contentRef.current.addEventListener('click', handleClick)
    return () => contentRef.current?.removeEventListener('click', handleClick)
  }, [onArticleClick, article])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.07]">
          <button onClick={onBack} className="text-[13px] text-white/40 hover:text-white/70 transition-colors flex items-center gap-1 mb-4">
            <ArrowLeft className="w-3.5 h-3.5" />
            Terug
          </button>
          <div className="h-6 w-48 bg-white/[0.06] rounded animate-pulse" />
          <div className="h-4 w-32 bg-white/[0.04] rounded animate-pulse mt-2" />
        </div>
        <div className="flex-1 px-6 py-6 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 bg-white/[0.04] rounded animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <p className="text-[14px] text-white/40">{error || 'Artikel niet gevonden'}</p>
        <button onClick={onBack} className="text-[13px] text-white/50 hover:text-white/70 transition-colors">
          Terug
        </button>
      </div>
    )
  }

  const catColor = getCategoryColor(article.category)
  const evidence = evidenceConfig[article.evidence_rating] || evidenceConfig['expert-consensus']
  const typeBadge = typeConfig[article.type] || typeConfig.ai
  const readTime = article.content_html ? estimateReadTime(article.content_html) : 3

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.07] shrink-0">
        <button
          onClick={onBack}
          className="text-[13px] text-white/40 hover:text-white/70 transition-colors flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Terug
        </button>

        <h1 className="text-[22px] font-semibold text-white/90 leading-tight">
          {article.title}
        </h1>

        <p className="text-[13px] text-white/35 mt-1.5">
          {article.summary}
        </p>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className={`text-[11px] px-2 py-1 rounded-full ${catColor.bg} ${catColor.text}`}>
            {article.category}
          </span>
          <span className={`text-[11px] px-2 py-1 rounded-full border ${evidence.color}`}>
            {evidence.icon} {evidence.label}
          </span>
          <span className={`text-[11px] px-2 py-1 rounded-full border ${typeBadge.color}`}>
            {typeBadge.label}
          </span>
          <span className="text-[11px] text-white/25 ml-1">
            {readTime} min read
          </span>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-6 py-6">
          {/* Article body */}
          <div
            className="wiki-article-content prose-wiki"
            dangerouslySetInnerHTML={{ __html: article.content_html || '' }}
          />

          {/* Citations */}
          {citations.length > 0 && (
            <div className="mt-10 pt-6 border-t border-white/[0.07]">
              <h3 className="text-[14px] font-semibold text-white/60 mb-3">Bronnen</h3>
              <ol className="space-y-2">
                {citations.map((c) => (
                  <li key={c.citation_number} className="text-[12px] text-white/35 leading-relaxed">
                    <span className="text-white/20 mr-1.5">[{c.citation_number}]</span>
                    {c.authors}{c.year ? ` (${c.year})` : ''}.{' '}
                    <span className="text-white/50">{c.title}</span>.{' '}
                    {c.publication}
                    {c.url && (
                      <>
                        {' '}
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400/60 hover:text-blue-400/80 underline underline-offset-2"
                        >
                          Link
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Author & meta */}
          <div className="mt-8 pt-4 border-t border-white/[0.07] text-[11px] text-white/20">
            <p>Door {article.author} · Laatst bijgewerkt {new Date(article.updated_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
