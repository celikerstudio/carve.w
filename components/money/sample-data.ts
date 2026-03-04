// ---------------------------------------------------------------------------
// Carve Money -- Types and sample data
// ---------------------------------------------------------------------------

export type SpendingCategory =
  | "housing"
  | "dining"
  | "shopping"
  | "transport"
  | "travel"
  | "entertainment"
  | "utilities"
  | "subscriptions"

export type SubscriptionCategory = "entertainment" | "utilities" | "software"

export interface Transaction {
  id: string
  merchant: string
  amount: number
  date: string
  category: SpendingCategory
  subcategory: string
  isRecurring: boolean
}

export interface Subscription {
  id: string
  name: string
  plan: string
  cost: number
  frequency: "monthly" | "yearly"
  category: SubscriptionCategory
  nextBillDate: string
  icon: string
  color: string
  isActive: boolean
  startDate: string
}

export interface CategorySpending {
  category: SpendingCategory
  amount: number
  percentage: number
  transactionCount: number
  icon: string
  color: string
}

export interface MonthlySpending {
  month: string
  totalSpend: number
  changePercent: number
  highestCategory: SpendingCategory
  highestCategoryPercent: number
  categories: CategorySpending[]
}

export interface SavingsInsight {
  id: string
  type: "duplicate" | "price_hike" | "unused"
  title: string
  description: string
  savingsAmount?: number
  icon: string
}

// ---------------------------------------------------------------------------
// Category configuration
// ---------------------------------------------------------------------------

export interface CategoryConfig {
  icon: string
  label: string
  color: string
}

export const CATEGORY_CONFIG: Record<SpendingCategory, CategoryConfig> = {
  housing: { icon: "\uD83C\uDFE0", label: "Housing", color: "bg-primary/20" },
  dining: { icon: "\uD83C\uDF7D\uFE0F", label: "Dining", color: "bg-purple-500/10" },
  shopping: { icon: "\uD83D\uDECD\uFE0F", label: "Shopping", color: "bg-indigo-500/10" },
  transport: { icon: "\uD83D\uDE97", label: "Transport", color: "bg-pink-500/10" },
  travel: { icon: "\u2708\uFE0F", label: "Travel", color: "bg-orange-500/10" },
  entertainment: { icon: "\uD83C\uDFAC", label: "Entertainment", color: "bg-cyan-500/10" },
  utilities: { icon: "\u26A1", label: "Utilities", color: "bg-emerald-500/10" },
  subscriptions: { icon: "\uD83D\uDD01", label: "Subscriptions", color: "bg-slate-500/10" },
}

// ---------------------------------------------------------------------------
// Sample monthly spending (October 2023)
// ---------------------------------------------------------------------------

export const sampleMonthlySpending: MonthlySpending = {
  month: "October 2023",
  totalSpend: 12450,
  changePercent: 15,
  highestCategory: "housing",
  highestCategoryPercent: 35,
  categories: [
    {
      category: "housing",
      amount: 4200,
      percentage: 35,
      transactionCount: 3,
      icon: CATEGORY_CONFIG.housing.icon,
      color: CATEGORY_CONFIG.housing.color,
    },
    {
      category: "dining",
      amount: 1800,
      percentage: 15,
      transactionCount: 12,
      icon: CATEGORY_CONFIG.dining.icon,
      color: CATEGORY_CONFIG.dining.color,
    },
    {
      category: "travel",
      amount: 1500,
      percentage: 12,
      transactionCount: 4,
      icon: CATEGORY_CONFIG.travel.icon,
      color: CATEGORY_CONFIG.travel.color,
    },
    {
      category: "shopping",
      amount: 950,
      percentage: 8,
      transactionCount: 8,
      icon: CATEGORY_CONFIG.shopping.icon,
      color: CATEGORY_CONFIG.shopping.color,
    },
    {
      category: "transport",
      amount: 720,
      percentage: 6,
      transactionCount: 15,
      icon: CATEGORY_CONFIG.transport.icon,
      color: CATEGORY_CONFIG.transport.color,
    },
    {
      category: "entertainment",
      amount: 680,
      percentage: 5,
      transactionCount: 6,
      icon: CATEGORY_CONFIG.entertainment.icon,
      color: CATEGORY_CONFIG.entertainment.color,
    },
    {
      category: "utilities",
      amount: 450,
      percentage: 4,
      transactionCount: 5,
      icon: CATEGORY_CONFIG.utilities.icon,
      color: CATEGORY_CONFIG.utilities.color,
    },
    {
      category: "subscriptions",
      amount: 200,
      percentage: 2,
      transactionCount: 7,
      icon: CATEGORY_CONFIG.subscriptions.icon,
      color: CATEGORY_CONFIG.subscriptions.color,
    },
  ],
}

// ---------------------------------------------------------------------------
// Sample transactions
// ---------------------------------------------------------------------------

export const sampleTransactions: Transaction[] = [
  {
    id: "txn-001",
    merchant: "Luxury Rentals LLC",
    amount: 4200,
    date: "2023-10-01",
    category: "housing",
    subcategory: "Rent",
    isRecurring: true,
  },
  {
    id: "txn-002",
    merchant: "TaskRabbit Inc.",
    amount: 85,
    date: "2023-10-03",
    category: "housing",
    subcategory: "Home Services",
    isRecurring: false,
  },
  {
    id: "txn-003",
    merchant: "Home Depot",
    amount: 342,
    date: "2023-10-05",
    category: "shopping",
    subcategory: "Home Improvement",
    isRecurring: false,
  },
  {
    id: "txn-004",
    merchant: "Uber",
    amount: 28.5,
    date: "2023-10-07",
    category: "transport",
    subcategory: "Rideshare",
    isRecurring: false,
  },
  {
    id: "txn-005",
    merchant: "Nobu",
    amount: 420,
    date: "2023-10-08",
    category: "dining",
    subcategory: "Fine Dining",
    isRecurring: false,
  },
  {
    id: "txn-006",
    merchant: "Delta Airlines",
    amount: 780,
    date: "2023-10-10",
    category: "travel",
    subcategory: "Flights",
    isRecurring: false,
  },
  {
    id: "txn-007",
    merchant: "Zara",
    amount: 215,
    date: "2023-10-12",
    category: "shopping",
    subcategory: "Clothing",
    isRecurring: false,
  },
  {
    id: "txn-008",
    merchant: "AMC Theatres",
    amount: 32,
    date: "2023-10-14",
    category: "entertainment",
    subcategory: "Movies",
    isRecurring: false,
  },
  {
    id: "txn-009",
    merchant: "ConEdison",
    amount: 185,
    date: "2023-10-15",
    category: "utilities",
    subcategory: "Electricity",
    isRecurring: true,
  },
  {
    id: "txn-010",
    merchant: "Verizon",
    amount: 95,
    date: "2023-10-16",
    category: "utilities",
    subcategory: "Phone",
    isRecurring: true,
  },
]

// ---------------------------------------------------------------------------
// Sample subscriptions
// ---------------------------------------------------------------------------

export const sampleSubscriptions: Subscription[] = [
  {
    id: "sub-001",
    name: "Netflix",
    plan: "Premium 4K",
    cost: 19.99,
    frequency: "monthly",
    category: "entertainment",
    nextBillDate: "2023-11-01",
    icon: "\uD83C\uDFAC",
    color: "#E50914",
    isActive: true,
    startDate: "2020-03-15",
  },
  {
    id: "sub-002",
    name: "Spotify",
    plan: "Premium Family",
    cost: 14.99,
    frequency: "monthly",
    category: "entertainment",
    nextBillDate: "2023-11-05",
    icon: "\uD83C\uDFB5",
    color: "#1DB954",
    isActive: true,
    startDate: "2019-08-22",
  },
  {
    id: "sub-003",
    name: "Adobe CC",
    plan: "All Apps",
    cost: 54.99,
    frequency: "monthly",
    category: "software",
    nextBillDate: "2023-11-10",
    icon: "\uD83C\uDFA8",
    color: "#FF0000",
    isActive: true,
    startDate: "2021-01-10",
  },
  {
    id: "sub-004",
    name: "Figma",
    plan: "Professional",
    cost: 12,
    frequency: "monthly",
    category: "software",
    nextBillDate: "2023-11-12",
    icon: "\uD83D\uDD8C\uFE0F",
    color: "#A259FF",
    isActive: true,
    startDate: "2022-06-01",
  },
  {
    id: "sub-005",
    name: "AWS",
    plan: "Pay-as-you-go",
    cost: 85.43,
    frequency: "monthly",
    category: "software",
    nextBillDate: "2023-11-01",
    icon: "\u2601\uFE0F",
    color: "#FF9900",
    isActive: true,
    startDate: "2021-09-18",
  },
  {
    id: "sub-006",
    name: "X Premium",
    plan: "Premium+",
    cost: 8,
    frequency: "monthly",
    category: "entertainment",
    nextBillDate: "2023-11-08",
    icon: "\uD83D\uDC26",
    color: "#1DA1F2",
    isActive: true,
    startDate: "2023-04-20",
  },
  {
    id: "sub-007",
    name: "Equinox",
    plan: "All Access",
    cost: 245,
    frequency: "monthly",
    category: "utilities",
    nextBillDate: "2023-11-01",
    icon: "\uD83C\uDFCB\uFE0F",
    color: "#000000",
    isActive: true,
    startDate: "2022-01-05",
  },
]

// ---------------------------------------------------------------------------
// Budget configuration per category
// ---------------------------------------------------------------------------

export interface CategoryBudget {
  category: SpendingCategory
  budgetLimit: number
  spent: number
  icon: string
  label: string
}

export const sampleCategoryBudgets: CategoryBudget[] = [
  { category: "housing", budgetLimit: 4500, spent: 4200, icon: "\uD83C\uDFE0", label: "Housing" },
  { category: "dining", budgetLimit: 1500, spent: 1800, icon: "\uD83C\uDF7D\uFE0F", label: "Dining" },
  { category: "travel", budgetLimit: 2000, spent: 1500, icon: "\u2708\uFE0F", label: "Travel" },
  { category: "shopping", budgetLimit: 1000, spent: 950, icon: "\uD83D\uDECD\uFE0F", label: "Shopping" },
  { category: "transport", budgetLimit: 800, spent: 720, icon: "\uD83D\uDE97", label: "Transport" },
  { category: "entertainment", budgetLimit: 600, spent: 680, icon: "\uD83C\uDFAC", label: "Entertainment" },
  { category: "utilities", budgetLimit: 500, spent: 450, icon: "\u26A1", label: "Utilities" },
  { category: "subscriptions", budgetLimit: 500, spent: 200, icon: "\uD83D\uDD01", label: "Subscriptions" },
]

// ---------------------------------------------------------------------------
// Spending trends (current vs previous month)
// ---------------------------------------------------------------------------

export interface SpendingTrend {
  category: SpendingCategory
  currentMonth: number
  previousMonth: number
  icon: string
  label: string
}

export const sampleSpendingTrends: SpendingTrend[] = [
  { category: "housing", currentMonth: 4200, previousMonth: 4200, icon: "\uD83C\uDFE0", label: "Housing" },
  { category: "dining", currentMonth: 1800, previousMonth: 1420, icon: "\uD83C\uDF7D\uFE0F", label: "Dining" },
  { category: "travel", currentMonth: 1500, previousMonth: 2100, icon: "\u2708\uFE0F", label: "Travel" },
  { category: "shopping", currentMonth: 950, previousMonth: 780, icon: "\uD83D\uDECD\uFE0F", label: "Shopping" },
  { category: "transport", currentMonth: 720, previousMonth: 650, icon: "\uD83D\uDE97", label: "Transport" },
  { category: "entertainment", currentMonth: 680, previousMonth: 520, icon: "\uD83C\uDFAC", label: "Entertainment" },
  { category: "utilities", currentMonth: 450, previousMonth: 430, icon: "\u26A1", label: "Utilities" },
  { category: "subscriptions", currentMonth: 200, previousMonth: 188, icon: "\uD83D\uDD01", label: "Subscriptions" },
]

// ---------------------------------------------------------------------------
// Smart tips for insights page
// ---------------------------------------------------------------------------

export interface SmartTip {
  id: string
  title: string
  description: string
  icon: string
  category: "save" | "optimize" | "alert" | "reward"
}

export const sampleSmartTips: SmartTip[] = [
  {
    id: "tip-001",
    title: "Switch to Annual Billing",
    description: "Switching Figma and Spotify to yearly plans could save you $48/year.",
    icon: "\uD83D\uDCB0",
    category: "save",
  },
  {
    id: "tip-002",
    title: "Dining Spend Increasing",
    description: "Your dining expenses are up 27% compared to last month. Consider setting a weekly limit.",
    icon: "\uD83D\uDCC9",
    category: "alert",
  },
  {
    id: "tip-003",
    title: "Great Job on Travel",
    description: "You reduced travel spending by 29% this month. Keep it up!",
    icon: "\u2B50",
    category: "reward",
  },
  {
    id: "tip-004",
    title: "Bundle Your Streaming",
    description: "Consider a bundle deal for Netflix + Spotify to save up to $5/month.",
    icon: "\uD83D\uDD17",
    category: "optimize",
  },
]

// ---------------------------------------------------------------------------
// Sample savings insights
// ---------------------------------------------------------------------------

export const sampleSavingsInsights: SavingsInsight[] = [
  {
    id: "insight-001",
    type: "duplicate",
    title: "Duplicate Detected",
    description:
      "You're paying for both Spotify ($14.99/mo) and Apple Music ($10.99/mo). Consider keeping just one.",
    savingsAmount: 10.99,
    icon: "\uD83D\uDD04",
  },
  {
    id: "insight-002",
    type: "price_hike",
    title: "Price Hike Alert",
    description:
      "Comcast increased your bill by $15/mo last quarter. Negotiating or switching could save you.",
    savingsAmount: 15,
    icon: "\uD83D\uDCC8",
  },
  {
    id: "insight-003",
    type: "unused",
    title: "Unused Subscription",
    description:
      "You haven't used Adobe CC in 45 days. Consider pausing or cancelling to save $54.99/mo.",
    savingsAmount: 54.99,
    icon: "\uD83D\uDCA4",
  },
]
