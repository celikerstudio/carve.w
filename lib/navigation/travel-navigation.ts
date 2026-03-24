export const travelNavigationGroups = [
  {
    label: 'CARVE TRAVEL',
    icon: { name: 'PlaneIcon' },
    items: [
      {
        title: "Dashboard",
        href: "/travel",
        icon: { name: 'DashboardIcon' },
        description: "Travel overview"
      },
      {
        title: "Trips",
        href: "/travel/trips",
        icon: { name: 'PlaneIcon' },
        description: "Your trips"
      },
      {
        title: "Map",
        href: "/travel/map",
        icon: { name: 'MapIcon' },
        description: "Trip map"
      },
      {
        title: "Budget",
        href: "/travel/budget",
        icon: { name: 'WalletIcon' },
        description: "Travel budget"
      },
      {
        title: "Settings",
        href: "/travel/settings",
        icon: { name: 'SettingsIcon' },
        description: "Travel settings"
      },
    ]
  },
];
