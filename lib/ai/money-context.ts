import { createClient } from '@/lib/supabase/server'

// @ai-why: Server-side money context builder for the coach-chat edge function.
// Matches the money fields expected by buildSystemPrompt() in coach-chat/index.ts.
// @ai-sync: ~/Developer/carve-ai/supabase/functions/coach-chat/index.ts

export interface MoneyCoachContext {
  monthlySpending: number | null
  monthlyBudget: number | null
  topSpendingCategories: string | null
  subscriptionTotal: number | null
  activeSubscriptionCount: number | null
  savingsGoal: number | null
  monthlyIncome: number | null
}

function getFirstOfMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export async function buildMoneyContext(userId: string): Promise<MoneyCoachContext> {
  const supabase = await createClient()
  const firstOfMonth = getFirstOfMonth(new Date())

  const [transactionsRes, budgetsRes, subscriptionsRes, profileRes] = await Promise.all([
    supabase
      .from('money_transactions')
      .select('amount, type, category')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('transaction_date', firstOfMonth),

    supabase
      .from('money_budgets')
      .select('monthly_limit')
      .eq('user_id', userId)
      .eq('month', firstOfMonth),

    supabase
      .from('money_subscriptions')
      .select('cost, frequency')
      .eq('user_id', userId)
      .eq('is_active', true),

    supabase
      .from('profiles')
      .select('monthly_income, savings_goal')
      .eq('id', userId)
      .single(),
  ])

  const expenses = transactionsRes.data ?? []
  const budgets = budgetsRes.data ?? []
  const subscriptions = subscriptionsRes.data ?? []

  // No money data at all → return nulls so edge function skips the section
  if (expenses.length === 0 && subscriptions.length === 0 && !profileRes.data?.monthly_income) {
    return {
      monthlySpending: null,
      monthlyBudget: null,
      topSpendingCategories: null,
      subscriptionTotal: null,
      activeSubscriptionCount: null,
      savingsGoal: profileRes.data?.savings_goal ?? null,
      monthlyIncome: profileRes.data?.monthly_income ?? null,
    }
  }

  // Monthly spending
  const monthlySpending = expenses.reduce((sum, t) => sum + Number(t.amount), 0)

  // Total budget
  const monthlyBudget = budgets.length > 0
    ? budgets.reduce((sum, b) => sum + Number(b.monthly_limit), 0)
    : null

  // Top spending categories
  const categoryMap = new Map<string, number>()
  for (const t of expenses) {
    categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + Number(t.amount))
  }
  const topCategories = [...categoryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat, amount]) => `${cat} (€${Math.round(amount)})`)
    .join(', ')

  // Subscription totals
  const subscriptionTotal = subscriptions.reduce((sum, s) => {
    return sum + (s.frequency === 'yearly' ? Number(s.cost) / 12 : Number(s.cost))
  }, 0)

  return {
    monthlySpending: Math.round(monthlySpending),
    monthlyBudget: monthlyBudget ? Math.round(monthlyBudget) : null,
    topSpendingCategories: topCategories || null,
    subscriptionTotal: Math.round(subscriptionTotal * 100) / 100,
    activeSubscriptionCount: subscriptions.length,
    savingsGoal: profileRes.data?.savings_goal ?? null,
    monthlyIncome: profileRes.data?.monthly_income ?? null,
  }
}
