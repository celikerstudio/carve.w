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
}
