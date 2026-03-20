// Unified dashboard navigation — one sidebar for all domains
export const unifiedNavigationGroups = [
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
