'use client'

import { useState, useMemo } from 'react'
import { Search, ArrowLeft } from 'lucide-react'
import { useWikiMeta } from './WikiMetadataProvider'
import { ArticleListItem } from './ArticleListItem'
import { getCategoryColor } from '@/lib/wiki/category-colors'
import { cn } from '@/lib/utils'

interface WikiCategoryViewProps {
  category: string | null
  onArticleClick: (slug: string) => void
  onCategoryChange: (category: string | null) => void
  onBackToChat?: () => void
}

export function WikiCategoryView({ category, onArticleClick, onCategoryChange, onBackToChat }: WikiCategoryViewProps) {
  const { articles, categories, loading } = useWikiMeta()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = articles
    if (category) {
      list = list.filter((a) => a.category === category)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)
      )
    }
    return list
  }, [articles, category, search])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-3 mb-4">
          {onBackToChat && (
            <button
              onClick={onBackToChat}
              className="text-[13px] text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Terug naar chat
            </button>
          )}
        </div>

        <h1 className="text-[20px] font-semibold text-white/90 mb-1">
          {category || 'Kennisbank'}
        </h1>
        <p className="text-[13px] text-white/35">
          {category
            ? `${filtered.length} artikel${filtered.length !== 1 ? 'en' : ''}`
            : `${articles.length} artikelen in ${categories.length} categorieën`
          }
        </p>

        {/* Category pills */}
        {!category && (
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((cat) => {
              const color = getCategoryColor(cat.name)
              return (
                <button
                  key={cat.name}
                  onClick={() => onCategoryChange(cat.name)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-[12px] font-medium transition-all',
                    color.bg, color.text, color.bgHover, 'border', color.border
                  )}
                >
                  {cat.name} ({cat.count})
                </button>
              )
            })}
          </div>
        )}

        {/* Back to all + search */}
        <div className="flex items-center gap-3 mt-4">
          {category && (
            <button
              onClick={() => onCategoryChange(null)}
              className="text-[12px] text-white/35 hover:text-white/60 transition-colors"
            >
              Alle categorieën
            </button>
          )}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              type="text"
              placeholder="Zoek artikelen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[13px] bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/[0.15] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Article list */}
      <div className="flex-1 overflow-y-auto py-2">
        {filtered.length === 0 ? (
          <div className="px-6 py-8 text-center text-[13px] text-white/25">
            Geen artikelen gevonden
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filtered.map((article) => (
              <ArticleListItem
                key={article.slug}
                article={article}
                onClick={onArticleClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
