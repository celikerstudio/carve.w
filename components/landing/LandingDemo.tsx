'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { LandingDemoChat } from './LandingDemoChat'
import { LandingDemoContext } from './LandingDemoContext'
import { DEMO_SCRIPTS, type PanelId } from './demo-steps'
import type { DomainId } from '@/lib/domains'

interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'tool' | 'typing'
  text?: string
  html?: string
  toolId?: string
  toolIcon?: string
  toolDone?: boolean
}

interface LandingDemoProps {
  domain: DomainId
}

// @ai-why: Speelt af op mount en niet meer op scroll (useInView is eruit). Op de
// oude homepage stond de demo halverwege de pagina, dus wachten tot hij in beeld
// kwam was juist; sinds TDR-0001 is dit een eigen pagina waar je met een klik
// naartoe komt, en dan is wachten op scroll wachten op niets.
export function LandingDemo({ domain }: LandingDemoProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activePanel, setActivePanel] = useState<PanelId>('empty')
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  const steps = DEMO_SCRIPTS[domain]

  const runDemo = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setMessages([])
    setActivePanel('empty')

    let elapsed = 0
    let msgCounter = 0

    steps.forEach((step) => {
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
  }, [steps])

  useEffect(() => {
    runDemo()
  }, [runDemo])

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout)
  }, [])

  return (
    <div id="demo" className="max-w-[1100px] mx-auto px-4 md:px-6">
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-[#111112] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        {/* @ai-why: Het contextpaneel stond op `hidden lg:block` en bestond onder
            1024px dus niet. Koud verkeer landt overwegend op mobiel, en juist dat
            paneel is het bewijs dat de coach je eigen data leest. Het staat daar nu
            ónder de chat in plaats van weg. Zie TDR-0002, "wat er hoe dan ook in zit". */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] h-[620px] lg:h-[520px]">
          <div className="lg:border-r border-white/[0.04] min-h-0">
            <LandingDemoChat messages={messages} />
          </div>
          <div className="border-t lg:border-t-0 border-white/[0.06] min-h-0">
            <LandingDemoContext activePanel={activePanel} />
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={runDemo}
          className="text-[11px] text-white/20 hover:text-white/40 transition-colors"
        >
          ↻ Replay demo
        </button>
      </div>
    </div>
  )
}
