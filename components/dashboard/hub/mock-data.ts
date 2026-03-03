import { Brain, Flame, Dumbbell, Trophy, TrendingUp, Wallet, BarChart3, Footprints, Plane, MapPin, CreditCard, PiggyBank, Receipt, Globe, Calendar, Compass } from 'lucide-react'
import type { ElementType } from 'react'

// Centralized icon map — all components import from here
export const iconMap: Record<string, ElementType> = {
  Brain, Flame, Dumbbell, Trophy, TrendingUp, Wallet, BarChart3, Footprints,
  Plane, MapPin, CreditCard, PiggyBank, Receipt, Globe, Calendar, Compass,
}

// Section config type — defines the chat personality per section
export interface SectionConfig {
  subtitle: string
  statusPills: { icon: string; label: string }[]
  suggestionChips: SuggestionChip[]
  coachReplies: Record<string, string>
}

export interface ChatMessage {
  id: string
  role: 'coach' | 'user'
  content: string
  timestamp: Date
}

export interface UserRankData {
  rankName: string
  currentXp: number
  nextLevelXp: number
  level: number
  streak: number
}

export interface TodayStat {
  icon: string
  label: string
  value: string
  detail?: string
}

export interface MoneySnapshot {
  monthlyBudget: number
  spent: number
  currency: string
  recentExpenses: { label: string; amount: number }[]
}

export interface Challenge {
  id: string
  label: string
  type: 'daily' | 'weekly'
  current: number
  target: number
}

export interface LeaderboardEntry {
  rank: number
  name: string
  xp: number
  isYou?: boolean
}

export interface SuggestionChip {
  id: string
  icon: string
  label: string
}

// --- Mock Data ---

export const mockRankData: UserRankData = {
  rankName: 'Intermediate',
  currentXp: 2450,
  nextLevelXp: 5000,
  level: 7,
  streak: 12,
}

export const mockTodayStats: TodayStat[] = [
  { icon: 'Dumbbell', label: 'Workouts', value: '3', detail: 'this week' },
  { icon: 'Footprints', label: 'Steps', value: '8,241', detail: 'today' },
  { icon: 'Flame', label: 'Calories', value: '1,840', detail: '/ 2,200' },
]

export const mockMoneySnapshot: MoneySnapshot = {
  monthlyBudget: 2000,
  spent: 1240,
  currency: '€',
  recentExpenses: [
    { label: 'Groceries', amount: 67.40 },
    { label: 'Spotify', amount: 10.99 },
  ],
}

export const mockChallenges: Challenge[] = [
  { id: '1', label: 'Log 3 meals', type: 'daily', current: 2, target: 3 },
  { id: '2', label: '4 workouts', type: 'weekly', current: 3, target: 4 },
  { id: '3', label: 'Hit step goal', type: 'daily', current: 8241, target: 10000 },
]

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Alex', xp: 12400 },
  { rank: 2, name: 'You', xp: 2450, isYou: true },
  { rank: 3, name: 'Sarah', xp: 2100 },
  { rank: 4, name: 'Mike', xp: 1800 },
]

export const mockSuggestionChips: SuggestionChip[] = [
  { id: '1', icon: 'TrendingUp', label: "What's my progress?" },
  { id: '2', icon: 'Dumbbell', label: 'Plan my workout' },
  { id: '3', icon: 'Wallet', label: "How's my budget?" },
  { id: '4', icon: 'BarChart3', label: 'Analyze my week' },
]

export const mockChatMessages: ChatMessage[] = []

export const mockStatusPills = [
  { icon: 'Flame', label: '12-day streak' },
  { icon: 'Dumbbell', label: '47 workouts' },
  { icon: 'Trophy', label: 'Level 7' },
]

// --- Section Configs ---

export const healthConfig: SectionConfig = {
  subtitle: "Hey there, I'm your Carve coach. Ask me anything about your health, fitness, or goals.",
  statusPills: mockStatusPills,
  suggestionChips: mockSuggestionChips,
  coachReplies: {
    "What's my progress?":
      "You're doing great! 3 workouts this week, 12-day streak going strong. Your XP puts you at Intermediate rank — 2,550 XP away from Advanced. Keep pushing!",
    'Plan my workout':
      "Based on your history, I'd suggest an upper body session today. You haven't hit chest/shoulders since Monday. Want me to build a quick plan?",
    "How's my budget?":
      "You've spent €1,240 of your €2,000 monthly budget. That's 62% with 12 days left. Your biggest category is groceries at €340. Looking solid!",
    'Analyze my week':
      "This week: 3 workouts (target 4), 8.2k avg steps, and nutrition is on point at 1,840 cal avg. Money-wise you're tracking under budget. One more workout and you'll hit all your goals!",
  },
}

export const moneyConfig: SectionConfig = {
  subtitle: "I'm your financial coach. Ask me about your spending, subscriptions, or savings goals.",
  statusPills: [
    { icon: 'Wallet', label: '€760 remaining' },
    { icon: 'CreditCard', label: '12 subscriptions' },
    { icon: 'TrendingUp', label: '-8% vs last month' },
  ],
  suggestionChips: [
    { id: 'm1', icon: 'Receipt', label: 'Where does my money go?' },
    { id: 'm2', icon: 'PiggyBank', label: 'How can I save more?' },
    { id: 'm3', icon: 'CreditCard', label: 'Review my subscriptions' },
    { id: 'm4', icon: 'BarChart3', label: 'Monthly spending analysis' },
  ],
  coachReplies: {
    'Where does my money go?':
      "Your top 3 categories this month: Groceries (€340, 27%), Dining Out (€215, 17%), and Subscriptions (€132, 11%). Groceries is up 12% from last month — mostly weekend shopping trips.",
    'How can I save more?':
      "Quick wins: You have 3 subscriptions you haven't used in 30+ days (€34/mo). Also, your dining out is €80 above your target. Switching 2 dinners to home cooking could save ~€120/mo.",
    'Review my subscriptions':
      "You have 12 active subscriptions totaling €132/mo. Top ones: Spotify (€11), Netflix (€13), iCloud (€3). I spotted 3 unused ones: Adobe CC, Headspace, and a gym membership. Want to review those?",
    'Monthly spending analysis':
      "March so far: €1,240 of €2,000 budget (62%). You're on pace to finish at ~€1,850 — under budget! Best improvement: groceries spending is more consistent week-over-week.",
  },
}

export const travelConfig: SectionConfig = {
  subtitle: "I'm your travel assistant. Ask me about your trips, budgets, or destinations.",
  statusPills: [
    { icon: 'Plane', label: 'Next trip: 12 days' },
    { icon: 'MapPin', label: '3 trips planned' },
    { icon: 'Globe', label: '5 countries visited' },
  ],
  suggestionChips: [
    { id: 't1', icon: 'Calendar', label: "What's my next trip?" },
    { id: 't2', icon: 'Wallet', label: 'Trip budget status' },
    { id: 't3', icon: 'Compass', label: 'Suggest a destination' },
    { id: 't4', icon: 'MapPin', label: 'Review my itinerary' },
  ],
  coachReplies: {
    "What's my next trip?":
      "Your next trip is Barcelona in 12 days! 5 nights, March 15-20. You have 3 of 5 days planned so far. Budget is set at €1,500. Want me to help fill in the remaining days?",
    'Trip budget status':
      "Barcelona budget: €1,500 total. Booked so far: flights (€280), hotel (€450), activities (€120). That leaves €650 for food, transport, and spontaneous plans. You're in great shape!",
    'Suggest a destination':
      "Based on your travel history (beach + city combos), I'd suggest Lisbon — great food scene, affordable, and you can combine city walks with nearby beaches. Flights from your area start at ~€90 in April!",
    'Review my itinerary':
      "Barcelona itinerary so far: Day 1 — Sagrada Familia + Gothic Quarter. Day 2 — Park Güell + beach. Day 3 — La Boqueria + Montjuïc. Days 4-5 are still empty. Want me to suggest some hidden gems?",
  },
}
