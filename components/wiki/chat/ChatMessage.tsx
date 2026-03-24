'use client'

import { useMemo } from 'react'
import { ChatBubble } from '@/components/dashboard/hub/chat/ChatBubble'
import { ArticleReferenceCard } from './ArticleReferenceCard'
import { useWikiMeta } from './WikiMetadataProvider'

// @ai-why: Wrapper around ChatBubble that handles [[slug]] parsing.
// ChatBubble stays pure (text in, rendered markdown out).
// Article cards only appear after streaming completes to avoid partial [[prot patterns.

const WIKI_REF_REGEX = /\[\[([a-z0-9-]+)\]\]/g

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  onArticleClick?: (slug: string) => void
}

export function ChatMessage({ role, content, isStreaming, onArticleClick }: ChatMessageProps) {
  const { getArticle } = useWikiMeta()

  const { cleanContent, articleSlugs } = useMemo(() => {
    // Don't parse during streaming — partial [[slug patterns would break
    if (isStreaming || role !== 'assistant') {
      return { cleanContent: content, articleSlugs: [] }
    }

    const slugs: string[] = []
    const cleaned = content.replace(WIKI_REF_REGEX, (_, slug: string) => {
      // Only extract if the article exists in our metadata
      if (getArticle(slug)) {
        slugs.push(slug)
        return ''
      }
      // Unknown slug — remove silently
      return ''
    }).trim()

    return { cleanContent: cleaned, articleSlugs: slugs }
  }, [content, isStreaming, role, getArticle])

  return (
    <>
      <ChatBubble role={role} content={cleanContent} />
      {articleSlugs.length > 0 && (
        <div className="px-4 pl-[52px]">
          {articleSlugs.map((slug) => {
            const meta = getArticle(slug)
            if (!meta) return null
            return (
              <ArticleReferenceCard
                key={slug}
                article={meta}
                onClick={onArticleClick || (() => {})}
              />
            )
          })}
        </div>
      )}
    </>
  )
}
