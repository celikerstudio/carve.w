'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'
import { LandingDemoChat } from './LandingDemoChat'
import { LandingDemoContext } from './LandingDemoContext'
import { DEMO_STEPS } from './demo-steps'

type PanelId = 'empty' | 'health' | 'money' | 'inbox' | 'life'

interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'tool' | 'typing'
  text?: string
  html?: string
  toolId?: string
  toolIcon?: string
  toolDone?: boolean
}

export function LandingDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activePanel, setActivePanel] = useState<PanelId>('empty')
  const [hasPlayed, setHasPlayed] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  const runDemo = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setMessages([])
    setActivePanel('empty')

    let elapsed = 0
    let msgCounter = 0

    DEMO_STEPS.forEach((step) => {
      elapsed += step.delay
      const timeout = setTimeout(() => {
        msgCounter++
        const id = `msg-${msgCounter}`

        switch (step.type) {
          case 'user-msg':
            setMessages(prev => prev.filter(m => m.type !== 'typing'))
            setMessages(prev => [...prev, { id, type: 'user', text: step.text }])
            break

          case 'tool-start':
            setMessages(prev => [...prev, {
              id: `tool-${step.toolId}`,
              type: 'tool',
              text: step.text,
              toolId: step.toolId,
              toolIcon: step.toolIcon,
              toolDone: false,
            }])
            if (step.panel) setActivePanel(step.panel)
            break

          case 'tool-done':
            setMessages(prev => prev.map(m =>
              m.toolId === step.toolId ? { ...m, toolDone: true } : m
            ))
            break

          case 'typing':
            setMessages(prev => [...prev, { id, type: 'typing' }])
            break

          case 'ai-msg':
            setMessages(prev => prev.filter(m => m.type !== 'typing'))
            setMessages(prev => [...prev, { id, type: 'ai', html: step.html }])
            break
        }
      }, elapsed)
      timeoutsRef.current.push(timeout)
    })
  }, [])

  useEffect(() => {
    if (isInView && !hasPlayed) {
      setHasPlayed(true)
      runDemo()
    }
  }, [isInView, hasPlayed, runDemo])

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout)
  }, [])

  return (
    <div ref={ref} id="demo" className="max-w-[1100px] mx-auto px-4 md:px-6">
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-[#111112] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] h-[480px] md:h-[520px]">
          <div className="border-r border-white/[0.04]">
            <LandingDemoChat messages={messages} />
          </div>
          <div className="hidden lg:block">
            <LandingDemoContext activePanel={activePanel} />
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={() => { setHasPlayed(false); runDemo() }}
          className="text-[11px] text-white/20 hover:text-white/40 transition-colors"
        >
          ↻ Replay demo
        </button>
      </div>
    </div>
  )
}
