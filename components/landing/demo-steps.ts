import type { DomainId } from '@/lib/domains'

export type DemoStepType =
  | 'user-msg'
  | 'tool-start'
  | 'tool-done'
  | 'typing'
  | 'ai-msg'

/**
 * @ai-why: 'inbox' staat hier niet meer bij. De oude simulatie liet de coach
 * live "Scanning inbox..." doen en meldde "14 auto-handled", terwijl de inbox
 * in de app uitstaat (AppSwitcher.tsx, uitgecommentarieerd) en mail alleen op
 * de achtergrond de andere domeinen vult. Dat was het meest zichtbare stuk van
 * de drift die TDR-0001 opruimt, dus het kan niet terugkomen in de demo waar
 * dezelfde TDR naartoe wijst.
 */
export type PanelId = 'empty' | DomainId

export interface DemoStep {
  type: DemoStepType
  delay: number
  text?: string
  html?: string
  toolId?: string
  toolIcon?: string
  panel?: PanelId
}

// @ai-why: Eén script per domein, en elk script raakt binnen twee beurten een
// tweede domein. De kaart belooft een richting, dus als alle drie hetzelfde
// gesprek geven is de keuze op de homepage betekenisloos. En het kruisen is
// waar het bewijs zit: TDR-0001 haalt de cross-domain-uitleg van de homepage af
// en legt hem hier neer.
// @ai-sync: lib/domains.ts — elke DomainId hoort een script te hebben.

const HEALTH: DemoStep[] = [
  { type: 'user-msg', delay: 900, text: 'Am I actually making progress?' },

  { type: 'tool-start', delay: 700, toolId: 'workouts', toolIcon: '♥', text: 'Reading workouts & recovery...', panel: 'health' },
  { type: 'tool-done', delay: 1000, toolId: 'workouts' },
  { type: 'tool-start', delay: 350, toolId: 'volume', toolIcon: '♥', text: 'Checking this week’s volume...' },
  { type: 'tool-done', delay: 900, toolId: 'volume' },
  { type: 'tool-start', delay: 350, toolId: 'food', toolIcon: '$', text: 'Cross-checking food & groceries...', panel: 'money' },
  { type: 'tool-done', delay: 900, toolId: 'food' },

  { type: 'typing', delay: 500 },
  { type: 'ai-msg', delay: 2000, html: `<span class="tag-health">♥ Health</span> Six sessions in fourteen days, <strong>12-day streak</strong>. Chest and shoulders are on schedule; hamstrings are two sets behind.<br/><br/>Your week sits at <strong>62%</strong>. Two sets of leg curls closes it.<br/><br/><span class="tag-money">$ Money</span> Protein averaged <strong>141g</strong> against your 150 target, and groceries are 18% up. Same cause: you ate out four times this week.` },

  { type: 'user-msg', delay: 3600, text: 'Fix the hamstrings then' },
  { type: 'tool-start', delay: 700, toolId: 'plan', toolIcon: '♥', text: 'Rebuilding leg day...', panel: 'health' },
  { type: 'tool-done', delay: 1200, toolId: 'plan' },
  { type: 'typing', delay: 500 },
  { type: 'ai-msg', delay: 2000, html: `Thursday is now:<br/><br/><strong>Romanian deadlift</strong> — 3 × 8 <span class="text-white/30">(new)</span><br/><strong>Seated leg curl</strong> — 3 × 12 <span class="text-white/30">(new)</span><br/><strong>Leg press</strong> — 3 × 10<br/><strong>Calf raise</strong> — 4 × 15<br/><br/>That puts hamstrings back on schedule this week. <span class="tag-health">Saved to your split</span>` },
]

const MONEY: DemoStep[] = [
  { type: 'user-msg', delay: 900, text: 'Where did my money go this month?' },

  { type: 'tool-start', delay: 700, toolId: 'tx', toolIcon: '$', text: 'Reading transactions...', panel: 'money' },
  { type: 'tool-done', delay: 1100, toolId: 'tx' },
  { type: 'tool-start', delay: 350, toolId: 'pattern', toolIcon: '$', text: 'Comparing to your usual pattern...' },
  { type: 'tool-done', delay: 1000, toolId: 'pattern' },

  { type: 'typing', delay: 500 },
  { type: 'ai-msg', delay: 2000, html: `<span class="tag-money">$ Money</span> <strong>€2.140 left</strong> of €3.400, with 11 days to go. That is €60 a day tighter than your normal August.<br/><br/>Two things did it. Groceries are <strong>€180 over</strong> your usual, and there is an <strong>€847 Coolblue bill</strong> due Friday that came in by mail.<br/><br/>Also: three streaming subscriptions, one untouched since May.` },

  { type: 'user-msg', delay: 3600, text: 'Can I still afford Barcelona?' },
  { type: 'tool-start', delay: 700, toolId: 'trip', toolIcon: '◆', text: 'Loading trip dates & bookings...', panel: 'life' },
  { type: 'tool-done', delay: 1100, toolId: 'trip' },
  { type: 'tool-start', delay: 350, toolId: 'recalc', toolIcon: '$', text: 'Recalculating the month...', panel: 'money' },
  { type: 'tool-done', delay: 900, toolId: 'recalc' },
  { type: 'typing', delay: 500 },
  { type: 'ai-msg', delay: 2000, html: `Yes, with room to spare.<br/><br/>Flight and hotel are <strong>paid</strong>. On your last three trips you spent €95 a day on the ground, so four days is roughly <strong>€380</strong>.<br/><br/>After the Coolblue bill that leaves <strong>€913</strong>. Cancel the unused subscription and it is €926 a year on top. <span class="tag-money">Trip budget set</span> <span class="tag-life">Added to Barcelona</span>` },
]

const LIFE: DemoStep[] = [
  { type: 'user-msg', delay: 900, text: "What's coming up?" },

  { type: 'tool-start', delay: 700, toolId: 'cal', toolIcon: '◆', text: 'Loading calendar & trips...', panel: 'life' },
  { type: 'tool-done', delay: 1100, toolId: 'cal' },

  { type: 'typing', delay: 500 },
  { type: 'ai-msg', delay: 1900, html: `<span class="tag-life">◆ Life</span> <strong>Barcelona in 3 days.</strong> Flight KL1677 at 09:40, hotel confirmed — both pulled from your mail.<br/><br/>After that: dentist on the 14th, and Sanne’s birthday on the 21st.<br/><br/>You also have two moments from last week without a note: the climbing gym and dinner at Nadia’s.` },

  { type: 'user-msg', delay: 3600, text: 'What should I budget for Barcelona?' },
  { type: 'tool-start', delay: 700, toolId: 'abroad', toolIcon: '$', text: 'Reading what you spend abroad...', panel: 'money' },
  { type: 'tool-done', delay: 1200, toolId: 'abroad' },
  { type: 'typing', delay: 500 },
  { type: 'ai-msg', delay: 2000, html: `<strong>€95 a day</strong>, based on Lisbon, Milan and Vienna. Four days is about <strong>€380</strong>.<br/><br/>Food is where it goes: €52 a day, roughly double what you spend at home. Everything else you keep flat.<br/><br/>Your August budget carries it, <em>after</em> the €847 Coolblue bill on Friday. <span class="tag-money">Set aside €400</span> <span class="tag-life">Added to the trip</span>` },
]

export const DEMO_SCRIPTS: Record<DomainId, DemoStep[]> = {
  health: HEALTH,
  money: MONEY,
  life: LIFE,
}
