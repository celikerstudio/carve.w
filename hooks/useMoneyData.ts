'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ──────────────────────────────────────────────────────────

export interface MoneyTransaction {
  id: string
  amount: number
  type: 'expense' | 'income'
  category: string
  description: string
  transaction_date: string
  currency: string
  is_recurring: boolean
}

export interface MoneyBudget {
  id: string
  category: string
  monthly_limit: number
  month: string // DATE as ISO string
}

export interface MoneySubscription {
  id: string
  name: string
  cost: number
  frequency: 'monthly' | 'yearly'
  category: string | null
  start_date: string
  billing_day: number | null
  is_active: boolean
}

export interface MoneyProfile {
  monthly_income: number | null
  savings_goal: number | null
  currency: string
}

export interface CategorySummary {
  category: string
  total: number
}

export interface BudgetStatus {
  category: string
  spent: number
  limit: number
}

export interface MoneySummary {
  monthlySpending: number
  monthlyIncome: number
  topCategories: CategorySummary[]
  subscriptionTotal: number
  activeSubscriptionCount: number
  budgetStatus: BudgetStatus[]
}

export interface MoneyData {
  transactions: MoneyTransaction[]
  budgets: MoneyBudget[]
  subscriptions: MoneySubscription[]
  profile: MoneyProfile
  summary: MoneySummary
}

// ─── Helpers ────────────────────────────────────────────────────────

function getFirstOfMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function calculateMonthlyCost(sub: MoneySubscription): number {
  return sub.frequency === 'yearly' ? sub.cost / 12 : sub.cost
}

function buildSummary(
  transactions: MoneyTransaction[],
  budgets: MoneyBudget[],
  subscriptions: MoneySubscription[],
  profile: MoneyProfile,
): MoneySummary {
  const expenses = transactions.filter((t) => t.type === 'expense')
  const income = transactions.filter((t) => t.type === 'income')

  const monthlySpending = expenses.reduce((sum, t) => sum + Number(t.amount), 0)
  const monthlyIncome = income.reduce((sum, t) => sum + Number(t.amount), 0)
    || (profile.monthly_income ?? 0)

  // Group expenses by category
  const categoryMap = new Map<string, number>()
  for (const t of expenses) {
    categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + Number(t.amount))
  }
  const topCategories = [...categoryMap.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)

  // Active subscriptions
  const activeSubs = subscriptions.filter((s) => s.is_active)
  const subscriptionTotal = activeSubs.reduce((sum, s) => sum + calculateMonthlyCost(s), 0)

  // Budget status: join budgets with actual spending
  const budgetStatus = budgets.map((b) => ({
    category: b.category,
    spent: categoryMap.get(b.category) ?? 0,
    limit: Number(b.monthly_limit),
  }))

  return {
    monthlySpending,
    monthlyIncome,
    topCategories,
    subscriptionTotal: Math.round(subscriptionTotal * 100) / 100,
    activeSubscriptionCount: activeSubs.length,
    budgetStatus,
  }
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useMoneyData(userId: string | null) {
  const [data, setData] = useState<MoneyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMoneyData = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const now = new Date()
      const firstOfMonth = getFirstOfMonth(now)

      const [transactionsRes, budgetsRes, subscriptionsRes, profileRes] = await Promise.all([
        supabase
          .from('money_transactions')
          .select('id, amount, type, category, description, transaction_date, currency, is_recurring')
          .eq('user_id', userId)
          .gte('transaction_date', firstOfMonth)
          .order('transaction_date', { ascending: false }),

        supabase
          .from('money_budgets')
          .select('id, category, monthly_limit, month')
          .eq('user_id', userId)
          .eq('month', firstOfMonth),

        supabase
          .from('money_subscriptions')
          .select('id, name, cost, frequency, category, start_date, billing_day, is_active')
          .eq('user_id', userId)
          .eq('is_active', true),

        supabase
          .from('profiles')
          .select('monthly_income, savings_goal, currency')
          .eq('id', userId)
          .single(),
      ])

      // Check for query errors
      if (transactionsRes.error) throw transactionsRes.error
      if (budgetsRes.error) throw budgetsRes.error
      if (subscriptionsRes.error) throw subscriptionsRes.error
      // Profile error is non-fatal — use defaults

      const transactions = (transactionsRes.data ?? []) as MoneyTransaction[]
      const budgets = (budgetsRes.data ?? []) as MoneyBudget[]
      const subscriptions = (subscriptionsRes.data ?? []) as MoneySubscription[]
      const profile: MoneyProfile = {
        monthly_income: profileRes.data?.monthly_income ?? null,
        savings_goal: profileRes.data?.savings_goal ?? null,
        currency: profileRes.data?.currency ?? 'EUR',
      }

      const summary = buildSummary(transactions, budgets, subscriptions, profile)

      setData({ transactions, budgets, subscriptions, profile, summary })
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchMoneyData()
  }, [fetchMoneyData])

  return { data, loading, error, refetch: fetchMoneyData }
}
