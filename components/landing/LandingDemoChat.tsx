'use client'

import { useEffect, useRef } from 'react'

interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'tool' | 'typing'
  text?: string
  html?: string
  toolId?: string
  toolIcon?: string
  toolDone?: boolean
}

interface LandingDemoChatProps {
  messages: ChatMessage[]
}

export function LandingDemoChat({ messages }: LandingDemoChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.04]">
        <div className="w-[6px] h-[6px] rounded-full bg-[#22c55e]" />
        <span className="text-[13px] font-semibold text-white/50">Carve</span>
        <span className="ml-auto text-[11px] text-white/20">Connected to your data</span>
      </div>

      {/* Messages */}
      {/* @ai-why: De berichten komen binnen met een CSS-animatie en niet met
          framer-motion. Een bericht begint op opacity 0, en in een achtergrondtab
          knijpt de browser requestAnimationFrame terwijl de setTimeout-keten van de
          demo gewoon doorloopt: framer bevriest dan halverwege en de berichten
          blijven permanent onzichtbaar, ook nadat je terugklikt. De kaarten op de
          homepage zijn links, dus /demo in een nieuw tabblad openen is normaal
          gedrag. Een CSS-animatie met fill-mode `both` landt hoe dan ook op de
          eindstand. Zelfde afweging als in LandingDemoContext en DomainPicker. */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide px-5 py-5 flex flex-col gap-3.5">
        {messages.map((msg) => (
          <div key={msg.id} className="carve-msg-in">
              {msg.type === 'user' && (
                <div className="flex justify-end">
                  <span className="inline-block bg-white/[0.06] px-3.5 py-2.5 rounded-[14px] rounded-br-[4px] text-[13px] text-white/75 max-w-[85%]">
                    {msg.text}
                  </span>
                </div>
              )}

              {msg.type === 'tool' && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-mono ${
                  msg.toolDone
                    ? 'bg-white/[0.01] border-[#22c55e]/10 text-white/25'
                    : 'bg-white/[0.02] border-white/[0.04] text-white/25'
                }`}>
                  <span className="text-[12px]">{msg.toolIcon}</span>
                  {msg.text}
                  {msg.toolDone ? (
                    <span className="text-[#22c55e] text-[9px] ml-auto">✓</span>
                  ) : (
                    <div className="w-[10px] h-[10px] border-[1.5px] border-white/10 border-t-white/30 rounded-full animate-spin ml-auto" />
                  )}
                </div>
              )}

              {msg.type === 'typing' && (
                <div className="flex gap-1 py-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-[5px] h-[5px] rounded-full bg-[#c8b86e]/30"
                      style={{
                        animation: `typingPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              )}

              {msg.type === 'ai' && msg.html && (
                <div
                  className="text-[13px] leading-[1.65] text-white/55 max-w-[90%] landing-demo-ai"
                  dangerouslySetInnerHTML={{ __html: msg.html }}
                />
              )}
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="px-5 py-3 border-t border-white/[0.04]">
        <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
          <span className="text-[13px] text-white/15 flex-1">Ask anything about your life...</span>
          <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/20 text-[12px]">
            ↑
          </div>
        </div>
      </div>
    </div>
  )
}
