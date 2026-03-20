export type DemoStepType =
  | 'user-msg'
  | 'tool-start'
  | 'tool-done'
  | 'typing'
  | 'ai-msg'

export interface DemoStep {
  type: DemoStepType
  delay: number
  text?: string
  html?: string
  toolId?: string
  toolIcon?: string
  panel?: 'empty' | 'health' | 'money' | 'inbox' | 'life'
}

export const DEMO_STEPS: DemoStep[] = [
  { type: 'user-msg', delay: 1000, text: "What's my week looking like?" },

  { type: 'tool-start', delay: 800, toolId: 'health', toolIcon: '♥', text: 'Reading health data...', panel: 'health' },
  { type: 'tool-done', delay: 1000, toolId: 'health' },
  { type: 'tool-start', delay: 350, toolId: 'money', toolIcon: '$', text: 'Checking budget & bills...', panel: 'money' },
  { type: 'tool-done', delay: 1000, toolId: 'money' },
  { type: 'tool-start', delay: 350, toolId: 'inbox', toolIcon: '✉', text: 'Scanning inbox...', panel: 'inbox' },
  { type: 'tool-done', delay: 800, toolId: 'inbox' },
  { type: 'tool-start', delay: 350, toolId: 'life', toolIcon: '◆', text: 'Loading calendar & trips...', panel: 'life' },
  { type: 'tool-done', delay: 800, toolId: 'life' },

  { type: 'typing', delay: 500 },
  { type: 'ai-msg', delay: 2000, html: `<span class="tag-health">♥ Health</span> Push Day today, Pull tomorrow, Legs Thursday. <strong>12-day streak</strong> — don't break it.<br/><br/><span class="tag-money">$ Money</span> <strong>€847 Coolblue bill</strong> due Friday. Budget at 63% with 11 days left.<br/><br/><span class="tag-inbox">✉ Inbox</span> 2 emails need you: Coolblue invoice and KLM confirmation. <strong>14 auto-handled</strong> this morning.<br/><br/><span class="tag-life">◆ Life</span> <strong>Barcelona in 3 days.</strong> Flight KL1677 at 09:40. Hotel confirmed.<br/><br/><span class="text-white/35">Grocery budget is tight. Want me to replan meals to stay within budget?</span>` },

  { type: 'user-msg', delay: 3500, text: 'Yes, keep protein above 150g' },
  { type: 'tool-start', delay: 700, toolId: 'meals', toolIcon: '♥', text: 'Analyzing meal history & prices...', panel: 'health' },
  { type: 'tool-done', delay: 1200, toolId: 'meals' },
  { type: 'tool-start', delay: 300, toolId: 'budget', toolIcon: '$', text: 'Recalculating grocery budget...', panel: 'money' },
  { type: 'tool-done', delay: 900, toolId: 'budget' },
  { type: 'typing', delay: 500 },
  { type: 'ai-msg', delay: 2000, html: `Done. 4-day meal plan — all within budget:<br/><br/><strong>Today</strong> — Chicken stir-fry, rice, broccoli <span class="text-[#22c55e]/50">(52g protein)</span><br/><strong>Thu</strong> — Greek yogurt + tuna wrap <span class="text-[#22c55e]/50">(61g protein)</span><br/><strong>Fri</strong> — Eggs, oats + leftover chicken <span class="text-[#22c55e]/50">(48g protein)</span><br/><strong>Sat</strong> — Travel day — airport meal: €15 <span class="text-[#a855f7]/50">(Barcelona)</span><br/><br/>Grocery cost: <strong>€31</strong>. Each day hits 150g+ with your regular breakfast.<br/><span class="tag-money">Saved to budget</span> <span class="tag-health">Logged to meal plan</span>` },
]
