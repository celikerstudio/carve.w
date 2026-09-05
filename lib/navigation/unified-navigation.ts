import { SHOW_MONEY } from '@/lib/flags'

// Unified dashboard navigation — one sidebar for all domains
const allNavigationGroups = [
  {
    label: 'CARVE AI',
    icon: { name: 'SparklesIcon' },
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: { name: 'SparklesIcon' },
        description: "AI assistant home"
      },
    ]
  },
  {
    label: 'INBOX',
    icon: { name: 'InboxIcon' },
    items: [
      {
        title: "Mail",
        href: "/dashboard/inbox",
        icon: { name: 'MailIcon' },
        description: "Your email inbox"
      },
      {
        title: "Handled by AI",
        href: "/dashboard/inbox/handled",
        icon: { name: 'CheckIcon' },
        description: "Auto-processed items"
      },
    ]
  },
  {
    label: 'HEALTH',
    icon: { name: 'HeartIcon' },
    items: [
      {
        title: "Workouts",
        href: "/dashboard/workouts",
        icon: { name: 'DumbbellIcon' },
        description: "Workout history & analytics"
      },
      {
        title: "Food",
        href: "/dashboard/food",
        icon: { name: 'AppleIcon' },
        description: "Nutrition tracking"
      },
    ]
  },
  {
    label: 'MONEY',
    icon: { name: 'WalletIcon' },
    items: [
      {
        title: "Transactions",
        href: "/dashboard/money/transactions",
        icon: { name: 'ReceiptIcon' },
        description: "Transaction history"
      },
      {
        title: "Subscriptions",
        href: "/dashboard/money/subscriptions",
        icon: { name: 'CreditCardIcon' },
        description: "Manage subscriptions"
      },
      {
        title: "Budget",
        href: "/dashboard/money/budgeting",
        icon: { name: 'PieChartIcon' },
        description: "Budget management"
      },
    ]
  },
  {
    label: 'LIFE',
    icon: { name: 'PlaneIcon' },
    items: [
      {
        title: "Trips",
        href: "/dashboard/life/trips",
        icon: { name: 'PlaneIcon' },
        description: "Your trips"
      },
      {
        title: "Map",
        href: "/dashboard/life/map",
        icon: { name: 'MapIcon' },
        description: "Trip map"
      },
    ]
  },
  {
    label: 'ACCOUNT',
    icon: { name: 'UserIcon' },
    items: [
      {
        title: "Profile",
        href: "/dashboard/profile",
        icon: { name: 'UserIcon' },
        description: "Your profile"
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: { name: 'SettingsIcon' },
        description: "App settings"
      },
    ]
  },
];

// @ai-why: De MONEY-groep verdwijnt uit de navigatie zodra `SHOW_MONEY` uit staat, en dat
// is in productie. Filteren bij de export en niet bij de consument: `unifiedNavigationGroups`
// wordt door de sidebar-controller gelezen en een gate per lezer is een gate die de
// volgende lezer vergeet.
// @ai-gotcha: Die drie links wezen naar `/dashboard/money/*` en dat pad bestaat niet —
// `app/(protected)/dashboard/` heeft geen money-submap. Ze waren dus al kapot vóór deze
// vlag; het filter verbergt geen werkende route maar drie 404's.
// @ai-sync: lib/flags.ts (SHOW_MONEY)
export const unifiedNavigationGroups = SHOW_MONEY
  ? allNavigationGroups
  : allNavigationGroups.filter((group) => group.label !== 'MONEY')
