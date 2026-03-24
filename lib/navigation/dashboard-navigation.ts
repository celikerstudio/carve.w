// Navigation for non-authenticated users (only login link)
export const loginNavigationGroups = [
  {
    label: 'ACCOUNT',
    icon: { name: 'UserIcon' },
    items: [
      {
        title: "Login",
        href: "/login",
        icon: { name: 'UserIcon' },
        description: "Sign in to your account"
      }
    ]
  }
];

// Full navigation for authenticated users (Health dashboard)
export const dashboardNavigationGroups = [
  {
    label: 'OVERVIEW',
    icon: { name: 'DashboardIcon' },
    items: [
      {
        title: "Dashboard",
        href: "/chat",
        icon: { name: 'DashboardIcon' },
        description: "Your dashboard home"
      }
    ]
  },
  {
    label: 'TRACKING',
    icon: { name: 'ChartIcon' },
    items: [
      {
        title: "Workouts",
        href: "/workouts",
        icon: { name: 'DumbbellIcon' },
        description: "Workout history & analytics"
      },
      {
        title: "Food",
        href: "/food",
        icon: { name: 'AppleIcon' },
        description: "Nutrition tracking"
      },
      {
        title: "Social",
        href: "/social",
        icon: { name: 'UsersIcon' },
        description: "Friends & activity feed"
      },
      {
        title: "Hiscores",
        href: "/hiscores",
        icon: { name: 'TrophyIcon' },
        description: "Global leaderboard"
      }
    ]
  },
  {
    label: 'ACCOUNT',
    icon: { name: 'UserIcon' },
    items: [
      {
        title: "Profile",
        href: "/profile",
        icon: { name: 'UserIcon' },
        description: "Your profile"
      },
      {
        title: "Settings",
        href: "/settings",
        icon: { name: 'SettingsIcon' },
        description: "App settings"
      }
    ]
  }
];
