'use client'

import { cn } from '@/lib/utils'
import type { CategorySpending, SpendingCategory } from '@/components/money/sample-data'

// Category-specific style definitions matching the reference design
const TREEMAP_STYLES: Record<
  string,
  { bg: string; hoverBg: string; border: string; text: string }
> = {
  housing: {
    bg: 'bg-[#e8e0d4]/20',
    hoverBg: 'hover:bg-[#e8e0d4]/30',
    border: 'border-[#e8e0d4]/20',
    text: 'text-[#e8e0d4]',
  },
  dining: {
    bg: 'bg-purple-500/10',
    hoverBg: 'hover:bg-purple-500/20',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
  },
  travel: {
    bg: 'bg-indigo-500/10',
    hoverBg: 'hover:bg-indigo-500/20',
    border: 'border-indigo-500/20',
    text: 'text-indigo-400',
  },
  shopping: {
    bg: 'bg-pink-500/10',
    hoverBg: 'hover:bg-pink-500/20',
    border: 'border-pink-500/20',
    text: 'text-pink-400',
  },
  transport: {
    bg: 'bg-orange-500/10',
    hoverBg: 'hover:bg-orange-500/20',
    border: 'border-orange-500/20',
    text: 'text-orange-400',
  },
  entertainment: {
    bg: 'bg-cyan-500/10',
    hoverBg: 'hover:bg-cyan-500/20',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
  },
  utilities: {
    bg: 'bg-emerald-500/10',
    hoverBg: 'hover:bg-emerald-500/20',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
  },
  subscriptions: {
    bg: 'bg-slate-500/10',
    hoverBg: 'hover:bg-slate-500/20',
    border: 'border-slate-500/20',
    text: 'text-slate-400',
  },
  health: {
    bg: 'bg-rose-500/10',
    hoverBg: 'hover:bg-rose-500/20',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
  },
  education: {
    bg: 'bg-amber-500/10',
    hoverBg: 'hover:bg-amber-500/20',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
  },
  personal: {
    bg: 'bg-blue-500/10',
    hoverBg: 'hover:bg-blue-500/20',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
  },
  other: {
    bg: 'bg-gray-500/10',
    hoverBg: 'hover:bg-gray-500/20',
    border: 'border-gray-500/20',
    text: 'text-gray-400',
  },
}

const DEFAULT_STYLE = TREEMAP_STYLES.other

// Hardcoded grid placements matching the reference layout
const GRID_PLACEMENTS: Record<string, string> = {
  housing: 'col-span-2 row-span-2',
  dining: 'col-span-2 row-span-1',
  travel: 'col-span-1 row-span-2',
  shopping: 'col-span-1 row-span-1',
  transport: 'col-span-1 row-span-1',
  entertainment: 'col-span-2 row-span-1',
  utilities: 'col-span-1 row-span-1',
  subscriptions: 'col-span-1 row-span-1',
}

// Categories that get the full display (large blocks)
const LARGE_CATEGORIES: SpendingCategory[] = ['housing']
// Categories that get medium detail
const MEDIUM_CATEGORIES: SpendingCategory[] = ['dining', 'travel', 'entertainment']

interface SpendingTreeMapProps {
  categories: CategorySpending[]
  onCategoryClick?: (category: SpendingCategory) => void
}

function formatAmount(amount: number): string {
  return '$' + amount.toLocaleString('en-US')
}

export function SpendingTreeMap({ categories, onCategoryClick }: SpendingTreeMapProps) {
  // Build a lookup from the categories array
  const categoryMap = new Map(categories.map((c) => [c.category, c]))

  // Render order matching the reference grid layout
  const renderOrder: SpendingCategory[] = [
    'housing',
    'dining',
    'travel',
    'shopping',
    'transport',
    'entertainment',
    'utilities',
    'subscriptions',
  ]

  return (
    <div className="relative">
      {/* TreeMap View label */}
      <div className="absolute top-3 left-3 z-10">
        <span className="text-[10px] font-medium bg-white/10 text-slate-400 px-2 py-1 rounded-md backdrop-blur-sm">
          TreeMap View
        </span>
      </div>

      <div className="grid grid-cols-4 grid-rows-4 gap-2 h-[480px]">
        {renderOrder.map((catKey) => {
          const cat = categoryMap.get(catKey)
          if (!cat) return null

          const styles = TREEMAP_STYLES[catKey]
          const placement = GRID_PLACEMENTS[catKey]
          const isLarge = LARGE_CATEGORIES.includes(catKey)
          const isMedium = MEDIUM_CATEGORIES.includes(catKey)

          return (
            <button
              key={catKey}
              onClick={() => onCategoryClick?.(catKey)}
              className={cn(
                'relative rounded-2xl border p-4 flex flex-col justify-between overflow-hidden',
                'bg-gradient-to-br from-white/5 to-transparent',
                'hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer',
                styles.bg,
                styles.hoverBg,
                styles.border,
                placement
              )}
            >
              {/* Content */}
              <div className="flex items-start justify-between">
                <span className="text-xl">{cat.icon}</span>
                <span
                  className={cn(
                    'text-[11px] font-semibold px-1.5 py-0.5 rounded-md',
                    styles.bg,
                    styles.text
                  )}
                >
                  {cat.percentage}%
                </span>
              </div>

              <div className="flex flex-col items-start mt-auto">
                <span
                  className={cn(
                    'font-semibold text-white',
                    isLarge ? 'text-base' : isMedium ? 'text-sm' : 'text-xs'
                  )}
                >
                  {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}
                </span>
                <span
                  className={cn(
                    'font-bold text-white',
                    isLarge ? 'text-xl' : isMedium ? 'text-base' : 'text-sm'
                  )}
                >
                  {formatAmount(cat.amount)}
                </span>
                {(isLarge || isMedium) && (
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    {cat.transactionCount} transactions
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
