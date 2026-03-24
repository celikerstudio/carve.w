'use client'

import { FileText } from 'lucide-react'
import { getCategoryColor } from '@/lib/wiki/category-colors'
import type { WikiArticleMeta } from '@/hooks/useWikiMetadata'

const evidenceLabels: Record<string, string> = {
  'well-established': 'Well-Established',
  'emerging-research': 'Emerging',
  'expert-consensus': 'Expert Consensus',
}

const typeLabels: Record<string, { label: string; color: string }> = {
  ai: { label: 'AI', color: 'bg-white/[0.08] text-white/40' },
  reviewed: { label: 'Verified', color: 'bg-emerald-500/15 text-emerald-400/80' },
  original: { label: 'Written by Carve', color: 'bg-blue-500/15 text-blue-400/80' },
}

interface ArticleReferenceCardProps {
  article: WikiArticleMeta
  onClick: (slug: string) => void
}

export function ArticleReferenceCard({ article, onClick }: ArticleReferenceCardProps) {
  const catColor = getCategoryColor(article.category)
  const evidence = evidenceLabels[article.evidence_rating] || article.evidence_rating
  const typeBadge = typeLabels[article.type] || typeLabels.ai

  return (
    <button
      onClick={() => onClick(article.slug)}
      className="w-full text-left mt-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all group cursor-pointer"
    >
      <div className="px-3.5 py-3 flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${catColor.bg} flex items-center justify-center shrink-0 mt-0.5`}>
          <FileText className={`w-4 h-4 ${catColor.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-white/85 group-hover:text-white/95 transition-colors truncate">
            {article.title}
          </p>
          <p className="text-[12px] text-white/40 mt-0.5 line-clamp-1">
            {article.summary}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${catColor.bg} ${catColor.text}`}>
              {article.category}
            </span>
            <span className="text-[10px] text-white/30">
              {evidence}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${typeBadge.color}`}>
              {typeBadge.label}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
