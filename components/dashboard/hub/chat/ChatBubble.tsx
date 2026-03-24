'use client'

import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import { Brain, AlertCircle } from 'lucide-react'

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
}

export const ChatBubble = memo(function ChatBubble({ role, content }: ChatBubbleProps) {
  const isAssistant = role === 'assistant'

  return (
    <div className={`flex items-start gap-2 px-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {isAssistant && (
        <div className="w-7 h-7 rounded-full bg-white/[0.07] border border-white/[0.08] flex items-center justify-center shrink-0 mt-1">
          <Brain className="w-3.5 h-3.5 text-white/45" />
        </div>
      )}

      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
          isAssistant
            ? 'bg-white/[0.06] border border-white/[0.08]'
            : 'bg-white/[0.12] border border-white/[0.10]'
        }`}
      >
        {isAssistant ? (
          <div className="text-[15px] text-white/85 leading-relaxed prose-chat">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-white/95">{children}</strong>,
                em: ({ children }) => <em className="italic text-white/75">{children}</em>,
                // @ai-why: Inline code gets pill styling. Block code (inside <pre>) gets its
                // styling stripped via Tailwind [&>code] on the pre element — no JS parent detection needed.
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 rounded-md bg-white/[0.08] text-[13px] font-mono text-white/80">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="my-2 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06] overflow-x-auto text-[13px] font-mono text-white/75 [&>code]:p-0 [&>code]:bg-transparent [&>code]:rounded-none">
                    {children}
                  </pre>
                ),
                ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4 list-disc space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4 list-decimal space-y-0.5">{children}</ol>,
                li: ({ children }) => <li className="text-white/80">{children}</li>,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400/80 hover:text-blue-400 underline underline-offset-2">
                    {children}
                  </a>
                ),
                h1: ({ children }) => <h1 className="text-[17px] font-semibold text-white/90 mb-1">{children}</h1>,
                h2: ({ children }) => <h2 className="text-[16px] font-semibold text-white/90 mb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-[15px] font-semibold text-white/90 mb-1">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-white/[0.15] pl-3 my-2 text-white/60 italic">
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="my-3 border-white/[0.08]" />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-[15px] text-white/85 leading-relaxed whitespace-pre-wrap">{content}</p>
        )}
      </div>

      {isAssistant && <div className="min-w-[40px]" />}
    </div>
  )
})

// Error bubble — shown when streaming fails
export function ChatErrorBubble({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 px-4">
      <div className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-1">
        <AlertCircle className="w-3.5 h-3.5 text-red-400/60" />
      </div>
      <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl bg-red-500/[0.06] border border-red-500/[0.12]">
        <p className="text-[14px] text-red-300/80 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  )
}
