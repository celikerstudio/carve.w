export const moneyNavigationGroups = [
  {
    label: 'CARVE MONEY',
    icon: { name: 'WalletIcon' },
    items: [
      {
        title: "Dashboard",
        href: "/money",
        icon: { name: 'DashboardIcon' },
        description: "Money overview"
      },
      {
        title: "Analytics",
        href: "/money/analytics",
        icon: { name: 'ChartIcon' },
        description: "Spending breakdown"
      },
      {
        title: "Subscriptions",
        href: "/money/subscriptions",
        icon: { name: 'CreditCardIcon' },
        description: "Manage subscriptions"
      },
      {
        title: "Transactions",
        href: "/money/transactions",
        icon: { name: 'ReceiptIcon' },
        description: "Transaction history"
      },
    ]
  },
  {
    label: 'MANAGE',
    icon: { name: 'SettingsIcon' },
    items: [
      {
        title: "Budgeting",
        href: "/money/budgeting",
        icon: { name: 'PieChartIcon' },
        description: "Budget management"
      },
      {
        title: "Insights",
        href: "/money/insights",
        icon: { name: 'LightbulbIcon' },
        description: "Savings insights"
      },
      {
        title: "Settings",
        href: "/money/settings",
        icon: { name: 'SettingsIcon' },
        description: "Money settings"
      }
    ]
  }
];
