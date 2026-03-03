'use client'

import { DashboardCard } from '../DashboardCard'
import { mockMoneySnapshot } from '../mock-data'

export function MoneyWidget() {
  const { monthlyBudget, spent, currency, recentExpenses } = mockMoneySnapshot
  const remaining = monthlyBudget - spent
  const progress = (spent / monthlyBudget) * 100

  return (
    <DashboardCard compact>
      <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7a8299] mb-3">Budget</p>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[14px] font-semibold text-white">
          {currency}{spent.toLocaleString()}
        </span>
        <span className="text-[12px] text-[#7a8299]">
          / {currency}{monthlyBudget.toLocaleString()}
        </span>
      </div>
      <div className="h-[3px] rounded-full bg-white/[0.05] mb-2">
        <div
          className="h-full rounded-full bg-[#34d399] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[12px] text-[#34d399] mb-3">
        {currency}{remaining.toLocaleString()} remaining
      </p>
      <div className="flex flex-col gap-1.5">
        {recentExpenses.map((expense) => (
          <div key={expense.label} className="flex items-center justify-between">
            <span className="text-[12px] text-[#9da6b9]">{expense.label}</span>
            <span className="text-[12px] text-[#7a8299]">
              {currency}{expense.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
