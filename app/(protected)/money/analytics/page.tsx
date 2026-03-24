'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChangeBadge } from '@/components/money/shared'
import {
  sampleMonthlySpending,
  sampleTransactions,
  CATEGORY_CONFIG,
  type SpendingCategory,
} from '@/components/money/sample-data'
import { MonthSelector } from '@/components/money/widgets/MonthSelector'
import { SpendingTreeMap } from '@/components/money/widgets/SpendingTreeMap'
import { TransactionsList } from '@/components/money/widgets/TransactionsList'

const MONTHS = ['Sep', 'Oct', 'Nov']

export default function AnalyticsPage() {
  const [selectedMonth, setSelectedMonth] = useState('Oct')
  const [filterCategory, setFilterCategory] = useState<SpendingCategory>('housing')

  const {
    month,
    totalSpend,
    changePercent,
    highestCategory,
    highestCategoryPercent,
    categories,
  } = sampleMonthlySpending

  const highestLabel = CATEGORY_CONFIG[highestCategory].label

  return (
    <div className="p-6 lg:p-10 h-full flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 mb-6"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#e8e0d4] font-medium">Analytics</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-600"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="text-slate-500">Spending Breakdown</span>
        </div>

        {/* Title row with month selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-white tracking-tight">{month}</h1>
          <MonthSelector
            months={MONTHS}
            selected={selectedMonth}
            onSelect={setSelectedMonth}
          />
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Total Spend</span>
            <span className="text-lg font-bold text-white">
              ${totalSpend.toLocaleString('en-US')}
            </span>
            <ChangeBadge value={changePercent} />
          </div>
          <div className="w-px h-5 bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Highest Category:</span>
            <span className="text-white font-semibold">{highestLabel}</span>
            <span className="text-slate-400">{highestCategoryPercent}%</span>
          </div>
        </div>
      </motion.div>

      {/* Two-column layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6 flex-1 min-h-0"
      >
        {/* Left: TreeMap */}
        <div>
          <SpendingTreeMap
            categories={categories}
            onCategoryClick={(cat) => setFilterCategory(cat)}
          />
        </div>

        {/* Right: Transactions */}
        <div className="min-h-0">
          <TransactionsList
            transactions={sampleTransactions}
            filterCategory={filterCategory}
          />
        </div>
      </motion.div>
    </div>
  )
}
